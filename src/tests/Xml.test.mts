import { Datam Trait, all } from "../index.mjs"

describe('Simplified Xml Tests', () => {
    const Attrs = Data({ Attr: ['name', 'value'] });
    const Node = Data({ Element: ['name', 'attrs', 'children'], Text: ['text'] });
    const { Attr } = Attrs,
        { Element, Text } = Node;
    // <html lang="en">
    //   <head>
    //     <title>Hello World!</title>
    //   </head>
    //   <body>
    //     <h1>Hello World!</h1>
    //   </body>
    // </html>
    const html = Element({
        name: 'html', attrs: [Attr({ name: 'lang', value: 'en' })],
        children: [
            Element({
                name: 'head', attrs: [],
                children: [
                    Element({
                        name: 'title', attrs: [],
                        children: [Text({ text: 'Hello World!' })]
                    })
                ]
            }),
            Element({
                name: 'body', attrs: [],
                children: [
                    Element({
                        name: 'h1', attrs: [],
                        children: [Text({ text: 'Hello World!' })]
                    })
                ]
            })
        ]
    });

    test('html declaration', () => {
        expect(html).toBeDefined();
        expect(html.name).toBe('html');
        expect(html.attrs).toBeDefined();
        expect(html.attrs.length).toBe(1);
        expect(html.attrs[0].name).toBe('lang');
        expect(html.attrs[0].value).toBe('en');
        expect(html.children).toBeDefined();
        expect(html.children.length).toBe(2);

        const head = html.children[0];
        expect(head.name).toBe('head');
        expect(head.attrs).toBeDefined();
        expect(head.attrs.length).toBe(0);
        expect(head.children).toBeDefined();
        expect(head.children.length).toBe(1);

        const title = head.children[0];
        expect(title.name).toBe('title');
        expect(title.attrs).toBeDefined();
        expect(title.attrs.length).toBe(0);
        expect(title.children).toBeDefined();
        expect(title.children.length).toBe(1);
        expect(title.children[0].text).toBe('Hello World!');

        const body = html.children[1];
        expect(body.name).toBe('body');
        expect(body.attrs).toBeDefined();
        expect(body.attrs.length).toBe(0);
        expect(body.children).toBeDefined();
        expect(body.children.length).toBe(1);

        const h1 = body.children[0];
        expect(h1.name).toBe('h1');
        expect(h1.attrs).toBeDefined();
        expect(h1.attrs.length).toBe(0);
        expect(h1.children).toBeDefined();
        expect(h1.children.length).toBe(1);
        expect(h1.children[0].text).toBe('Hello World!');
    })

    const print = Trait({
        Element: ({ name, attrs, children }) => {
            const attrsText = attrs.map(({ name, value }) => ` ${name}="${value}"`).join('');
            const childrenText = children.map(child => print(child)).join('');
            return `<${name}${attrsText}>${childrenText}</${name}>`;
        },
        Text: ({ text }) => text
    })

    test('html print', () => {
        expect(print(html)).toBe(
            '<html lang="en"><head><title>Hello World!</title></head><body><h1>Hello World!</h1></body></html>'
        );
    })

    //<xml>
    //  <a href='https://brave.com'>Be Brave</a>
    //  <a href="https://archive.org">Internet Archive</a>
    //</xml>
    const xml = Element({
        name: 'xml', attrs: [],
        children: [
            Element({
                name: 'a', attrs: [Attr({ name: 'href', value: 'https://brave.com' })],
                children: [Text({ text: 'Be Brave' })]
            })
        ]
    });

    const nodeName = Trait({
        [all]({ name }) { return name }
    })

    test('nodeName', () => {
        expect(nodeName(xml)).toBe('xml');
        expect(nodeName(xml.children[0])).toBe('a');
        expect(nodeName(xml.children[0].attrs[0])).toBe('href');
    })
})