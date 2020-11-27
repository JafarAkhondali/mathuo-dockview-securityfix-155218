import { GridviewComponent } from '../../gridview/gridviewComponent';
import { GridviewPanel } from '../../gridview/gridviewPanel';
import { IFrameworkPart } from '../../panel/types';
import { Orientation } from '../../splitview/core/splitview';

class TestGridview extends GridviewPanel {
    constructor(id: string, componentName: string) {
        super(id, componentName);
    }

    getComponent(): IFrameworkPart {
        return {
            update: (parmas) => {
                //
            },
            dispose: () => {
                //
            },
        };
    }
}

describe('gridview', () => {
    let container: HTMLElement;
    let gridview: GridviewComponent;

    beforeEach(() => {
        container = document.createElement('div');
        gridview = new GridviewComponent(container, {
            proportionalLayout: false,
            orientation: Orientation.VERTICAL,
            components: { default: TestGridview },
        });
    });

    test('added views are visible by default', () => {
        gridview.layout(800, 400);

        gridview.addPanel({
            id: 'panel_1',
            component: 'default',
        });

        const panel = gridview.getPanel('panel_1');

        expect(panel?.api.isVisible).toBeTruthy();
    });

    test('deserialize and serialize a layout', () => {
        gridview.layout(800, 400);
        gridview.fromJSON({
            grid: {
                height: 400,
                width: 800,
                orientation: Orientation.HORIZONTAL,
                root: {
                    type: 'branch',
                    size: 800,
                    data: [
                        {
                            type: 'leaf',
                            size: 300,
                            data: {
                                id: 'panel_1',
                                component: 'default',
                                snap: false,
                            },
                        },
                        {
                            type: 'leaf',
                            size: 300,
                            visible: false,
                            data: {
                                id: 'panel_2',
                                component: 'default',
                                snap: false,
                            },
                        },
                        {
                            type: 'leaf',
                            size: 200,
                            visible: true,
                            data: {
                                id: 'panel_3',
                                component: 'default',
                                snap: true,
                            },
                        },
                    ],
                },
            },
            activePanel: 'panel_1',
        });
        gridview.layout(800, 400, true);

        const panel1 = gridview.getPanel('panel_1');
        const panel2 = gridview.getPanel('panel_2');
        const panel3 = gridview.getPanel('panel_3');

        expect(panel1?.api.isVisible).toBeTruthy();
        expect(panel1?.api.id).toBe('panel_1');
        expect(panel1?.api.isActive).toBeTruthy();
        expect(panel1?.api.isFocused).toBeFalsy();
        expect(panel1?.api.height).toBe(400);
        expect(panel1?.api.width).toBe(300);

        expect(panel2?.api.isVisible).toBeFalsy();
        expect(panel2?.api.id).toBe('panel_2');
        expect(panel2?.api.isActive).toBeFalsy();
        expect(panel2?.api.isFocused).toBeFalsy();
        expect(panel2?.api.height).toBe(400);
        expect(panel2?.api.width).toBe(0);

        expect(panel3?.api.isVisible).toBeTruthy();
        expect(panel3?.api.id).toBe('panel_3');
        expect(panel3?.api.isActive).toBeFalsy();
        expect(panel3?.api.isFocused).toBeFalsy();
        expect(panel3?.api.height).toBe(400);
        expect(panel3?.api.width).toBe(500);

        expect(JSON.parse(JSON.stringify(gridview.toJSON()))).toEqual({
            grid: {
                height: 400,
                width: 800,
                orientation: Orientation.HORIZONTAL,
                root: {
                    type: 'branch',
                    size: 800,
                    data: [
                        {
                            type: 'leaf',
                            size: 300,
                            data: {
                                id: 'panel_1',
                                component: 'default',
                                snap: false,
                            },
                        },
                        {
                            type: 'leaf',
                            size: 300,
                            visible: false,
                            data: {
                                id: 'panel_2',
                                component: 'default',
                                snap: false,
                            },
                        },
                        {
                            type: 'leaf',
                            size: 500,
                            data: {
                                id: 'panel_3',
                                component: 'default',
                                snap: true,
                            },
                        },
                    ],
                },
            },
            activePanel: 'panel_1',
        });
    });
});
