import { Data } from "../Data.mjs"
import { Trait } from "../Trait.mjs";

describe('Simplified Xml Tests', () => {
    const Attrs = Data({ Attr: ['name', 'value'] });
    const Node = Data({ Element: ['name', 'attrs', 'children'], Text: ['text'] });
    // <html lang="en">
    //   <head>
    //     <title>Hello World!</title>
    //   </head>
    //   <body>
    //     <h1>Hello World!</h1>
    //   </body>
    // </html>
    const html = Node.Element({
        name: 'html', attrs: [Attrs.Attr({ name: 'lang', value: 'en' })],
        children: [
            Node.Element({
                name: 'head', attrs: [],
                children: [
                    Node.Element({
                        name: 'title', attrs: [],
                        children: [Node.Text({ text: 'Hello World!' })]
                    })
                ]
            }),
            Node.Element({
                name: 'body', attrs: [],
                children: [
                    Node.Element({
                        name: 'h1', attrs: [],
                        children: [Node.Text({ text: 'Hello World!' })]
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
})