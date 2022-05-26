import {
    getRelativeLocation,
    SerializedGridObject,
    getGridLocation,
} from './gridview';
import { Position } from '../dnd/droptarget';
import { tail, sequenceEquals } from '../array';
import { CompositeDisposable } from '../lifecycle';
import { IPanelDeserializer } from '../dockview/deserializer';
import { GridviewComponentOptions } from './options';
import {
    BaseGrid,
    Direction,
    IBaseGrid,
    IGridPanelView,
    toTarget,
} from './baseComponentGridview';
import {
    GridviewPanel,
    GridviewInitParameters,
    GridPanelViewState,
    IGridviewPanel,
} from './gridviewPanel';
import { BaseComponentOptions } from '../panel/types';
import { Orientation, Sizing } from '../splitview/core/splitview';
import { createComponent } from '../panel/componentFactory';
import { Emitter, Event } from '../events';

export interface SerializedGridview {
    grid: {
        height: number;
        width: number;
        orientation: Orientation;
        root: SerializedGridObject<GridPanelViewState>;
    };
    activePanel?: string;
}

export interface AddComponentOptions extends BaseComponentOptions {
    minimumWidth?: number;
    maximumWidth?: number;
    minimumHeight?: number;
    maximumHeight?: number;
    position?: {
        direction: Direction;
        referencePanel: string;
    };
    location?: number[];
}

export interface IGridPanelComponentView extends IGridPanelView {
    init: (params: GridviewInitParameters) => void;
}

export type GridviewComponentUpdateOptions = Pick<
    GridviewComponentOptions,
    'orientation' | 'components' | 'frameworkComponents'
>;

export interface IGridviewComponent extends IBaseGrid<GridviewPanel> {
    readonly orientation: Orientation;
    readonly onDidLayoutFromJSON: Event<void>;
    updateOptions(options: Partial<GridviewComponentUpdateOptions>): void;
    addPanel(options: AddComponentOptions): IGridviewPanel;
    removePanel(panel: IGridviewPanel, sizing?: Sizing): void;
    focus(): void;
    fromJSON(serializedGridview: SerializedGridview): void;
    toJSON(): SerializedGridview;
    movePanel(
        panel: IGridviewPanel,
        options: { direction: Direction; reference: string; size?: number }
    ): void;
    setVisible(panel: IGridviewPanel, visible: boolean): void;
    setActive(panel: IGridviewPanel): void;
}

export class GridviewComponent
    extends BaseGrid<GridviewPanel>
    implements IGridviewComponent
{
    private _options: Exclude<GridviewComponentOptions, 'orientation'>;
    private _deserializer: IPanelDeserializer | undefined;

    private readonly _onDidLayoutfromJSON = new Emitter<void>();
    readonly onDidLayoutFromJSON: Event<void> = this._onDidLayoutfromJSON.event;

    get orientation() {
        return this.gridview.orientation;
    }

    set orientation(value: Orientation) {
        this.gridview.orientation = value;
    }

    get options() {
        return this._options;
    }

    get deserializer(): IPanelDeserializer | undefined {
        return this._deserializer;
    }

    set deserializer(value: IPanelDeserializer | undefined) {
        this._deserializer = value;
    }

    constructor(element: HTMLElement, options: GridviewComponentOptions) {
        super(element, {
            proportionalLayout: options.proportionalLayout,
            orientation: options.orientation,
            styles: options.styles,
        });

        this._options = options;

        if (!this.options.components) {
            this.options.components = {};
        }
        if (!this.options.frameworkComponents) {
            this.options.frameworkComponents = {};
        }
    }

    updateOptions(options: Partial<GridviewComponentUpdateOptions>): void {
        const hasOrientationChanged =
            typeof options.orientation === 'string' &&
            this.gridview.orientation !== options.orientation;

        this._options = { ...this.options, ...options };

        if (hasOrientationChanged) {
            this.gridview.orientation = options.orientation!;
        }

        this.layout(this.gridview.width, this.gridview.height, true);
    }

    removePanel(panel: GridviewPanel) {
        this.removeGroup(panel);
    }

    /**
     * Serialize the current state of the layout
     *
     * @returns A JSON respresentation of the layout
     */
    public toJSON(): SerializedGridview {
        const data = this.gridview.serialize() as {
            height: number;
            width: number;
            orientation: Orientation;
            root: SerializedGridObject<GridPanelViewState>;
        };

        return {
            grid: data,
            activePanel: this.activeGroup?.id,
        };
    }

    setVisible(panel: GridviewPanel, visible: boolean): void {
        this.gridview.setViewVisible(getGridLocation(panel.element), visible);
    }

    setActive(panel: GridviewPanel): void {
        this._groups.forEach((value, _key) => {
            value.value.setActive(panel === value.value);
        });
    }

    focus() {
        this.activeGroup?.focus();
    }

    public fromJSON(serializedGridview: SerializedGridview) {
        this.clear();

        const { grid, activePanel } = serializedGridview;

        const queue: Function[] = [];

        this.gridview.deserialize(grid, {
            fromJSON: (node) => {
                const { data } = node;
                const view = createComponent(
                    data.id,
                    data.component,
                    this.options.components || {},
                    this.options.frameworkComponents || {},
                    this.options.frameworkComponentFactory
                        ? {
                              createComponent:
                                  this.options.frameworkComponentFactory
                                      .createComponent,
                          }
                        : undefined
                );

                queue.push(() =>
                    view.init({
                        params: data.params,
                        minimumWidth: data.minimumWidth,
                        maximumWidth: data.maximumWidth,
                        minimumHeight: data.minimumHeight,
                        maximumHeight: data.maximumHeight,
                        priority: data.priority,
                        snap: !!data.snap,
                        accessor: this,
                        isVisible: node.visible,
                    })
                );

                this._onDidAddGroup.fire(view);

                this.registerPanel(view);

                return view;
            },
        });

        this.layout(this.width, this.height, true);

        queue.forEach((f) => f());

        if (typeof activePanel === 'string') {
            const panel = this.getPanel(activePanel);
            if (panel) {
                this.doSetGroupActive(panel);
            }
        }

        this._onDidLayoutfromJSON.fire();
    }

    clear(): void {
        const hasActiveGroup = this.activeGroup;

        const groups = Array.from(this._groups.values()); // reassign since group panels will mutate
        for (const group of groups) {
            group.disposable.dispose();
            this.doRemoveGroup(group.value, { skipActive: true });
        }

        if (hasActiveGroup) {
            this.doSetGroupActive(undefined);
        }

        this.gridview.clear();
    }

    movePanel(
        panel: GridviewPanel,
        options: { direction: Direction; reference: string; size?: number }
    ): void {
        let relativeLocation: number[];

        const removedPanel = this.gridview.remove(panel) as GridviewPanel;

        const referenceGroup = this._groups.get(options.reference)?.value;

        if (!referenceGroup) {
            throw new Error(
                `reference group ${options.reference} does not exist`
            );
        }

        const target = toTarget(options.direction);
        if (target === Position.Center) {
            throw new Error(`${target} not supported as an option`);
        } else {
            const location = getGridLocation(referenceGroup.element);
            relativeLocation = getRelativeLocation(
                this.gridview.orientation,
                location,
                target
            );
        }

        this.doAddGroup(removedPanel, relativeLocation, options.size);
    }

    public addPanel(options: AddComponentOptions): IGridviewPanel {
        let relativeLocation: number[] = options.location || [0];

        if (options.position?.referencePanel) {
            const referenceGroup = this._groups.get(
                options.position.referencePanel
            )?.value;

            if (!referenceGroup) {
                throw new Error(
                    `reference group ${options.position.referencePanel} does not exist`
                );
            }

            const target = toTarget(options.position.direction);
            if (target === Position.Center) {
                throw new Error(`${target} not supported as an option`);
            } else {
                const location = getGridLocation(referenceGroup.element);
                relativeLocation = getRelativeLocation(
                    this.gridview.orientation,
                    location,
                    target
                );
            }
        }

        const view = createComponent(
            options.id,
            options.component,
            this.options.components || {},
            this.options.frameworkComponents || {},
            this.options.frameworkComponentFactory
                ? {
                      createComponent:
                          this.options.frameworkComponentFactory
                              .createComponent,
                  }
                : undefined
        );

        view.init({
            params: options.params || {},
            minimumWidth: options.minimumWidth,
            maximumWidth: options.maximumWidth,
            minimumHeight: options.minimumHeight,
            maximumHeight: options.maximumHeight,
            priority: options.priority,
            snap: !!options.snap,
            accessor: this,
            isVisible: true,
        });

        this.registerPanel(view);

        this.doAddGroup(view, relativeLocation, options.size);

        return view;
    }

    private registerPanel(panel: GridviewPanel) {
        const disposable = new CompositeDisposable(
            panel.api.onDidFocusChange((event) => {
                if (!event.isFocused) {
                    return;
                }
                this._groups.forEach((groupItem) => {
                    const group = groupItem.value;
                    if (group !== panel) {
                        group.setActive(false);
                    } else {
                        group.setActive(true);
                    }
                });
            })
        );

        this._groups.set(panel.id, {
            value: panel,
            disposable,
        });
    }

    public moveGroup(
        referenceGroup: IGridPanelComponentView,
        groupId: string,
        target: Position
    ) {
        const sourceGroup = this.getPanel(groupId);

        if (!sourceGroup) {
            throw new Error('invalid operation');
        }

        const referenceLocation = getGridLocation(referenceGroup.element);
        const targetLocation = getRelativeLocation(
            this.gridview.orientation,
            referenceLocation,
            target
        );

        const [targetParentLocation, to] = tail(targetLocation);
        const sourceLocation = getGridLocation(sourceGroup.element);
        const [sourceParentLocation, from] = tail(sourceLocation);

        if (sequenceEquals(sourceParentLocation, targetParentLocation)) {
            // special case when 'swapping' two views within same grid location
            // if a group has one tab - we are essentially moving the 'group'
            // which is equivalent to swapping two views in this case
            this.gridview.moveView(sourceParentLocation, from, to);

            return;
        }

        // source group will become empty so delete the group
        const targetGroup = this.doRemoveGroup(sourceGroup, {
            skipActive: true,
            skipDispose: true,
        });

        // after deleting the group we need to re-evaulate the ref location
        const updatedReferenceLocation = getGridLocation(
            referenceGroup.element
        );
        const location = getRelativeLocation(
            this.gridview.orientation,
            updatedReferenceLocation,
            target
        );
        this.doAddGroup(targetGroup, location);
    }

    removeGroup(group: GridviewPanel) {
        super.removeGroup(group);
    }

    public dispose() {
        super.dispose();

        this._onDidLayoutfromJSON.dispose();
    }
}