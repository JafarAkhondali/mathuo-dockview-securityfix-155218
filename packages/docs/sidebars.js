/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    // By default, Docusaurus generates a sidebar from the docs folder structure
    tutorialSidebar: [
        {
            type: 'doc',
            id: 'index', // document ID
            label: 'Getting started', // sidebar label
        },
        {
            type: 'html',
            value: '<span class="sidebar-section">Overview</span>',
        },
        {
            type: 'category',
            label: 'Dockview',
            collapsible: true,
            collapsed: true,
            items: [{ type: 'autogenerated', dirName: 'components/dockview' }],
        },
        {
            type: 'category',
            label: 'Gridview',
            collapsible: true,
            collapsed: true,
            items: [{ type: 'autogenerated', dirName: 'components/gridview' }],
        },
        {
            type: 'category',
            label: 'Splitview',
            collapsible: true,
            collapsed: true,
            items: [{ type: 'autogenerated', dirName: 'components/splitview' }],
        },
        {
            type: 'category',
            label: 'Paneview',
            collapsible: true,
            collapsed: true,
            items: [{ type: 'autogenerated', dirName: 'components/paneview' }],
        },
    ],
    api: [
        {
            type: 'category',
            label: 'Dockview',
            collapsible: false,
            collapsed: false,
            items: [{ type: 'autogenerated', dirName: 'api/dockview' }],
        },
        {
            type: 'category',
            label: 'Gridview',
            collapsible: false,
            collapsed: false,
            items: [{ type: 'autogenerated', dirName: 'api/gridview' }],
        },
        {
            type: 'category',
            label: 'Splitview',
            collapsible: false,
            collapsed: false,
            items: [{ type: 'autogenerated', dirName: 'api/splitview' }],
        },
        {
            type: 'category',
            label: 'Paneview',
            collapsible: false,
            collapsed: false,
            items: [{ type: 'autogenerated', dirName: 'api/paneview' }],
        },
    ],

    // But you can create a sidebar manually
    /*
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Tutorial',
      items: ['hello'],
    },
  ],
   */
};

module.exports = sidebars;
