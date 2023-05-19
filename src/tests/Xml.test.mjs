import { data, trait, complect } from "../index.mjs"

describe('Simplified Xml Tests', () => {
    const xmlData = data({
        Attr: { name: String, value: String },
        Element: { name: String, attrs: {}, children: {} },
        Text: { text: String }
    })

    const Printable = trait('print', {
        Attr({ name, value }) { return `${name}="${value}"` },
        Element: ({ name, attrs, children }) => {
            const attrsText = attrs.length == 0 ?
                '' : ' ' + attrs.map(attr => attr.print()).join(' ');
            const childrenText = children.map(child => child.print()).join('');
            return `<${name}${attrsText}>${childrenText}</${name}>`;
        },
        Text: ({ text }) => text
    })

    const NodeNameTrait = trait('nodeName', {
        _: ({ name }) => name
    })

    const xml = complect(xmlData, [Printable, NodeNameTrait]),
        { Attr, Element, Text } = xml;

    // <html lang="en">
    //   <head>
    //     <title>Hello World!</title>
    //   </head>
    //   <body>
    //     <h1>Hello World!</h1>
    //   </body>
    // </html>

    test('html declaration', () => {
        const htmlExp = Element('html', [Attr('lang', 'en')], [
            Element('head', [], [
                Element('title', [], [Text('Hello World!')])
            ]),
            Element('body', [], [
                Element('h1', [], [Text('Hello World!')])
            ])
        ]);

        expect(htmlExp).toBeDefined();
        expect(htmlExp.name).toBe('html');
        expect(htmlExp.attrs).toBeDefined();
        expect(htmlExp.attrs.length).toBe(1);
        expect(htmlExp.attrs[0].name).toBe('lang');
        expect(htmlExp.attrs[0].value).toBe('en');
        expect(htmlExp.children).toBeDefined();
        expect(htmlExp.children.length).toBe(2);

        const head = htmlExp.children[0];
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

        const body = htmlExp.children[1];
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

    test('html print', () => {
        const htmlExp = Element('html', [Attr('lang', 'en')], [
            Element('head', [], [
                Element('title', [], [Text('Hello World!')])
            ]),
            Element('body', [], [
                Element('h1', [], [Text('Hello World!')])
            ])
        ]);

        expect(htmlExp.print()).toBe(
            '<html lang="en"><head><title>Hello World!</title></head><body><h1>Hello World!</h1></body></html>'
        );
    })

    //<xml>
    //  <a href='https://brave.com'>Be Brave</a>
    //  <a href="https://archive.org">Internet Archive</a>
    //</xml>
    const xmlExp = Element('xml', [], [
        Element('a', [Attr('href', 'https://brave.com')], [Text('Be Brave')]),
        Element('a', [Attr('href', 'https://archive.org')], [Text('Internet Archive')])
    ]);

    test('nodeName', () => {
        expect(xmlExp.nodeName()).toBe('xml');
        expect(xmlExp.children[0].nodeName()).toBe('a');
        expect(xmlExp.children[0].attrs[0].nodeName()).toBe('href');
    })
})