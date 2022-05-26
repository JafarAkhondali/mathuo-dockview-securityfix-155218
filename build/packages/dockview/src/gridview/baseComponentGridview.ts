import { Emitter, Event, TickDelayedEvent } from '../events';
import { getGridLocation, Gridview, IGridView } from './gridview';
import { Position } from '../dnd/droptarget';
import { CompositeDisposable, IValueDisposable } from '../lifecycle';
import { sequentialNumberGenerator } from '../math';
import {
    ISplitviewStyles,
    Orientation,
    Sizing,
} from '../splitview/core/splitview';
import { IPanel } from '../panel/types';
import { MovementOptions2 } from '../dockview/options';

const nextLayoutId = sequentialNumberGenerator();

export type Direction = 'left' | 'right' | 'above' | 'below' | 'within';

export function toTarget(direction: Direction) {
    switch (direction) {
        case 'left':
            return Position.Left;
        case 'right':
            return Position.Right;
        case 'above':
            return Position.Top;
        case 'below':
            return Position.Bottom;
        case 'within':
        default:
            return Position.Center;
    }
}

export interface BaseGridOptions {
    readonly proportionalLayout: boolean;
    readonly orientation: Orientation;
    readonly styles?: ISplitviewStyles;
}

export interface IGridPanelView extends IGridView, IPanel {
    setActive(isActive: boolean): void;
    readonly isActive: boolean;
}

export interface IBaseGrid<T extends IGridPanelView> {
    readonly element: HTMLElement;
    readonly id: string;
    readonly width: number;
    readonly height: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly activeGroup: T | undefined;
    readonly size: number;
    readonly groups: T[];
    readonly onDidLayoutChange: Event<void>;
    readonly onDidRemoveGroup: Event<T>;
    readonly onDidAddGroup: Event<T>;
    readonly onDidActiveGroupChange: Event<T | undefined>;
    getPanel(id: string): T | undefined;
    toJSON(): object;
    fromJSON(data: any): void;
    clear(): void;
    layout(width: number, height: number, force?: boolean): void;
    setVisible(panel: T, visible: boolean): void;
    isVisible(panel: T): boolean;
}

export abstract class BaseGrid<T extends IGridPanelView>
    extends CompositeDisposable
    implements IBaseGrid<T>
{
    private readonly _id = nextLayoutId.next();
    protected readonly _groups = new Map<string, IValueDisposable<T>>();
    protected readonly gridview: Gridview;
    //
    protected _activeGroup: T | undefined;

    private _onDidLayoutChange = new Emitter<void>();
    readonly onDidLayoutChange = this._onDidLayoutChange.event;

    private readonly _onDidRemoveGroup = new Emitter<T>();
    readonly onDidRemoveGroup: Event<T> = this._onDidRemoveGroup.event;

    protected readonly _onDidAddGroup = new Emitter<T>();
    readonly onDidAddGroup: Event<T> = this._onDidAddGroup.event;

    private readonly _onDidActiveGroupChange = new Emitter<T | undefined>();
    readonly onDidActiveGroupChange: Event<T | undefined> =
        this._onDidActiveGroupChange.event;

    protected readonly _bufferOnDidLayoutChange = new TickDelayedEvent();

    get id() {
        return this._id;
    }

    get element() {
        return this._element;
    }

    get size() {
        return this._groups.size;
    }

    get groups() {
        return Array.from(this._groups.values()).map((_) => _.value);
    }

    get width() {
        return this.gridview.width;
    }

    get height() {
        return this.gridview.height;
    }

    get minimumHeight() {
        return this.gridview.minimumHeight;
    }
    get maximumHeight() {
        return this.gridview.maximumHeight;
    }
    get minimumWidth() {
        return this.gridview.minimumWidth;
    }
    get maximumWidth() {
        return this.gridview.maximumWidth;
    }

    get activeGroup(): T | undefined {
        return this._activeGroup;
    }

    constructor(
        private readonly _element: HTMLElement,
        options: BaseGridOptions
    ) {
        super();

        this.gridview = new Gridview(
            !!options.proportionalLayout,
            options.styles,
            options.orientation
        );

        this.element.appendChild(this.gridview.element);

        this.layout(0, 0, true); // set some elements height/widths

        this.addDisposables(
            this.gridview.onDidChange(() => {
                this._bufferOnDidLayoutChange.fire();
            })
        );

        this.addDisposables(
            Event.any(
                this.onDidAddGroup,
                this.onDidRemoveGroup,
                this.onDidActiveGroupChange
            )(() => {
                this._bufferOnDidLayoutChange.fire();
            }),
            this._bufferOnDidLayoutChange.onEvent(() => {
                this._onDidLayoutChange.fire();
            }),
            this._bufferOnDidLayoutChange
        );
    }

    public abstract toJSON(): object;

    public abstract fromJSON(data: any): void;

    public abstract clear(): void;

    public setVisible(panel: T, visible: boolean) {
        this.gridview.setViewVisible(getGridLocation(panel.element), visible);
        this._onDidLayoutChange.fire();
    }

    public isVisible(panel: T) {
        return this.gridview.isViewVisible(getGridLocation(panel.element));
    }

    protected doAddGroup(group: T, location: number[] = [0], size?: number) {
        this.gridview.addView(group, size ?? Sizing.Distribute, location);

        this._onDidAddGroup.fire(group);

        this.doSetGroupActive(group);
    }

    protected doRemoveGroup(
        group: T,
        options?: { skipActive?: boolean; skipDispose?: boolean }
    ) {
        if (!this._groups.has(group.id)) {
            throw new Error('invalid operation');
        }

        const item = this._groups.get(group.id);

        const view = this.gridview.remove(group, Sizing.Distribute);

        if (item && !options?.skipDispose) {
            item.disposable.dispose();
            item.value.dispose();
            this._groups.delete(group.id);
        }

        this._onDidRemoveGroup.fire(group);

        if (!options?.skipActive && this._activeGroup === group) {
            const groups = Array.from(this._groups.values());

            this.doSetGroupActive(
                groups.length > 0 ? groups[0].value : undefined
            );
        }

        return view as T;
    }

    public getPanel(id: string): T | undefined {
        return this._groups.get(id)?.value;
    }

    public doSetGroupActive(group: T | undefined, skipFocus?: boolean) {
        if (this._activeGroup === group) {
            return;
        }
        if (this._activeGroup) {
            this._activeGroup.setActive(false);
            if (!skipFocus) {
                this._activeGroup.focus();
            }
        }

        if (group) {
            group.setActive(true);
            if (!skipFocus) {
                group.focus();
            }
        }

        this._activeGroup = group;

        this._onDidActiveGroupChange.fire(group);
    }

    public removeGroup(group: T) {
        this.doRemoveGroup(group);
    }

    public moveToNext(options?: MovementOptions2) {
        if (!options) {
            options = {};
        }
        if (!options.group) {
            if (!this.activeGroup) {
                return;
            }
            options.group = this.activeGroup;
        }

        const location = getGridLocation(options.group.element);
        const next = this.gridview.next(location)?.view;
        this.doSetGroupActive(next as T);
    }

    public moveToPrevious(options?: MovementOptions2) {
        if (!options) {
            options = {};
        }
        if (!options.group) {
            if (!this.activeGroup) {
                return;
            }
            options.group = this.activeGroup;
        }

        const location = getGridLocation(options.group.element);
        const next = this.gridview.previous(location)?.view;
        this.doSetGroupActive(next as T);
    }

    public layout(width: number, height: number, forceResize?: boolean): void {
        const different =
            forceResize || width !== this.width || height !== this.height;

        if (!different) {
            return;
        }

        this.element.style.height = `${height}px`;
        this.element.style.width = `${width}px`;

        this.gridview.layout(width, height);
    }

    public dispose(): void {
        super.dispose();

        this._onDidActiveGroupChange.dispose();
        this._onDidAddGroup.dispose();
        this._onDidRemoveGroup.dispose();
        this._onDidLayoutChange.dispose();

        for (const group of this.groups) {
            group.dispose();
        }

        this.gridview.dispose();
    }
}