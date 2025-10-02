import { DataEntry } from "astro:content";

export const filesCollectionFixture: DataEntry[] = [
  {
    id: "about.de-CH",
    filePath: "src/content/pages/about.de-CH.mdx",
    data: {
      title: "Über mich",
    },
    body: `---
title: Über mich
---

Test
`,
  },
  {
    id: "projects.de-CH",
    filePath: "src/content/pages/subpath/projects.de-CH.mdx",
    data: {
      title: "Projekte",
    },
    body: `---
title: Projekte
---

Test
`,
  },
  {
    id: "about.zh-CN",
    filePath: "src/content/pages/about.zh-CN.mdx",
    data: {
      title: "关于我",
    },
    body: `---
title: 关于我
---

测试
`,
  },
  {
    id: "projects.zh-CN",
    filePath: "src/content/pages/subpath/projects.zh-CN.mdx",
    data: {
      title: "项目",
    },
    body: `---
title: 项目
---

测试
`,
  },
];

export const folderCollectionFixture: DataEntry[] = [
  {
    id: "de-CH/about",
    filePath: "src/content/pages/de-CH/about.mdx",
    data: {
      title: "Über mich",
    },
    body: `---
title: Über mich
---

Test
`,
  },
  {
    id: "de-CH/projects",
    filePath: "src/content/pages/de-CH/subpath/projects.mdx",
    data: {
      title: "Projekte",
    },
    body: `---
title: Projekte
---

Test
`,
  },
  {
    id: "zh-CN/about",
    filePath: "src/content/pages/zh-CN/about.mdx",
    data: {
      title: "关于我",
    },
    body: `---
title: 关于我
---

测试
`,
  },
  {
    id: "zh-CN/projects",
    filePath: "src/content/pages/zh-CN/subpath/projects.mdx",
    data: {
      title: "项目",
    },
    body: `---
title: 项目
---

测试
`,
  },
];

export const contentCollectionFixture: DataEntry[] = [
  {
    id: "space",
    filePath: "src/content/gallery/space.yml",
    data: {
      title: {
        "de-CH": "Weltraum",
        "zh-CN": "太空",
      },
      cover: "./space1.jpg",
      images: [
        { src: "./space1.jpg", title: { "de-CH": "Weltraum1", "zh-CN": "Space1" } },
        { src: "./space2.jpg", title: { "de-CH": "Weltraum2", "zh-CN": "Space2" } },
        { src: "./space3.jpg", title: { "de-CH": "Weltraum3", "zh-CN": "Space3" } },
        { src: "./space4.jpg", title: { "de-CH": "Weltraum4", "zh-CN": "Space4" } },
        { src: "./space5.jpg", title: { "de-CH": "Weltraum5", "zh-CN": "Space5" } },
      ],
    },
  },
  {
    id: "nature",
    filePath: "src/content/gallery/nature.yml",
    data: {
      title: {
        "de-CH": "Natur",
        "zh-CN": "自然",
      },
      cover: "./nature1.jpg",
      images: [
        { src: "./nature1.jpg" },
        { src: "./nature2.jpg" },
        { src: "./nature3.jpg" },
        { src: "./nature4.jpg" },
        { src: "./nature5.jpg" },
      ],
    },
  },
  {
    id: "animals",
    filePath: "src/content/gallery/animals.yml",
    data: {
      title: {
        "de-CH": "Tiere",
        "zh-CN": "动物",
      },
      cover: "./animals1.jpg",
      images: [
        { src: "./animals1.jpg" },
        { src: "./animals2.jpg" },
        { src: "./animals3.jpg" },
        { src: "./animals4.jpg" },
        { src: "./animals5.jpg" },
      ],
    },
  },
  {
    id: "omni",
    filePath: "src/content/gallery/omni.yml",
    data: {
      title: "Omni",
      cover: "./animals1.jpg",
      images: [
        { src: "./animals1.jpg" },
        { src: "./animals2.jpg" },
        { src: "./animals3.jpg" },
        { src: "./animals4.jpg" },
        { src: "./animals5.jpg" },
      ],
    },
  },
];

export const contentFileFixture: DataEntry[] = [
  {
    id: "space",
    filePath: "src/content/gallery/space.yml",
    data: {
      title: {
        "de-CH": "Weltraum",
        "zh-CN": "太空",
      },
      cover: "./space1.jpg",
      images: [
        { src: "./space1.jpg", title: { "de-CH": "Weltraum1", "zh-CN": "Space1" } },
        { src: "./space2.jpg", title: { "de-CH": "Weltraum2", "zh-CN": "Space2" } },
        { src: "./space3.jpg", title: { "de-CH": "Weltraum3", "zh-CN": "Space3" } },
        { src: "./space4.jpg", title: { "de-CH": "Weltraum4", "zh-CN": "Space4" } },
        { src: "./space5.jpg", title: { "de-CH": "Weltraum5", "zh-CN": "Space5" } },
      ],
    },
  },
  {
    id: "gallery",
    filePath: "src/content/gallery/gallery.yml",
    data: {
      items: [
        {
          photo: "./team/robin.jpg",
          label: {
            "de-CH": "Robin improvisiert beim Arbeiten",
            "zh-CN": "Robin即兴工作",
          },
        },
        {
          photo: "./team/robin-presents.jpeg",
          label: {
            "de-CH": "Robin präsentiert",
            "zh-CN": "Robin演示",
          },
        },
        {
          photo: "./team/our-lab.jpg",
          label: {
            "de-CH": "Unser Labor",
            "zh-CN": "我们的实验室",
          },
        },
        {
          photo: "./team/retraite-2024.jpg",
          label: {
            "de-CH": "Team-Retreat 2024",
            "zh-CN": "团队静修2024",
          },
        },
      ],
    },
  },
];

export const contentFileWithoutFixture: DataEntry[] = [
  {
    id: "omni",
    filePath: "src/content/gallery/omni.yml",
    data: {
      title: "Omni",
      cover: "./animals1.jpg",
      images: [
        { src: "./animals1.jpg" },
        { src: "./animals2.jpg" },
        { src: "./animals3.jpg" },
        { src: "./animals4.jpg" },
        { src: "./animals5.jpg" },
      ],
    },
  },
];
