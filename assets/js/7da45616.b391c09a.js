"use strict";(self.webpackChunkdockview_docs=self.webpackChunkdockview_docs||[]).push([[6360],{8559:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>m,frontMatter:()=>o,metadata:()=>i,toc:()=>s});var n=r(984),a=(r(6204),r(6575));const o={slug:"dockview-1.8.0-release",title:"Dockview 1.8.0",tags:["release"]},l="Release Notes",i={permalink:"/blog/dockview-1.8.0-release",editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2023-07-23-dockview-1.8.0.md",source:"@site/blog/2023-07-23-dockview-1.8.0.md",title:"Dockview 1.8.0",description:"Please reference to docs @ dockview.dev.",date:"2023-07-23T00:00:00.000Z",formattedDate:"July 23, 2023",tags:[{label:"release",permalink:"/blog/tags/release"}],readingTime:.23,hasTruncateMarker:!1,authors:[],frontMatter:{slug:"dockview-1.8.0-release",title:"Dockview 1.8.0",tags:["release"]},prevItem:{title:"Dockview 1.8.2",permalink:"/blog/dockview-1.8.2-release"},nextItem:{title:"Dockview 1.7.6",permalink:"/blog/dockview-1.7.6-release"}},c={authorsImageUrls:[]},s=[{value:"\ud83d\ude80 Features",id:"-features",level:2},{value:"\ud83d\udee0 Miscs",id:"-miscs",level:2},{value:"\ud83d\udd25 Breaking changes",id:"-breaking-changes",level:2}],u={toc:s},p="wrapper";function m(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Please reference to docs @ ",(0,a.kt)("a",{parentName:"p",href:"https://dockview.dev"},"dockview.dev"),"."),(0,a.kt)("h2",{id:"-features"},"\ud83d\ude80 Features"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Support for Floating Groups ",(0,a.kt)("a",{parentName:"li",href:"https://github.com/mathuo/dockview/pull/262"},"#262")),(0,a.kt)("li",{parentName:"ul"},"Left hand header changes ",(0,a.kt)("a",{parentName:"li",href:"https://github.com/mathuo/dockview/pull/264"},"#264")),(0,a.kt)("li",{parentName:"ul"},"Retain layout size ",(0,a.kt)("a",{parentName:"li",href:"https://github.com/mathuo/dockview/pull/285"},"#285")),(0,a.kt)("li",{parentName:"ul"},"Expose ",(0,a.kt)("inlineCode",{parentName:"li"},"removePanel")," ",(0,a.kt)("a",{parentName:"li",href:"https://github.com/mathuo/dockview/issues/293"},"#293")),(0,a.kt)("li",{parentName:"ul"},"Additional themes")),(0,a.kt)("h2",{id:"-miscs"},"\ud83d\udee0 Miscs"),(0,a.kt)("h2",{id:"-breaking-changes"},"\ud83d\udd25 Breaking changes"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"groupControlComponent")," renamed to ",(0,a.kt)("inlineCode",{parentName:"li"},"rightHeaderActionsComponent")," ",(0,a.kt)("a",{parentName:"li",href:"https://github.com/mathuo/dockview/pull/264"},"#264"))))}m.isMDXComponent=!0},6575:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>k});var n=r(6204);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),s=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},u=function(e){var t=s(e.components);return n.createElement(c.Provider,{value:t},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),p=s(r),d=a,k=p["".concat(c,".").concat(d)]||p[d]||m[d]||o;return r?n.createElement(k,l(l({ref:t},u),{},{components:r})):n.createElement(k,l({ref:t},u))}));function k(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,l=new Array(o);l[0]=d;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i[p]="string"==typeof e?e:a,l[1]=i;for(var s=2;s<o;s++)l[s]=r[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"}}]);
//# sourceMappingURL=7da45616.b391c09a.js.map