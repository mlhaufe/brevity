import { Data, Trait, _ } from "../index.mjs";

describe('Pattern matching', () => {
    test('Simplify expression', () => {
        const Expr = Data({
            Num: { value: {} },
            Var: { name: {} },
            Mul: { left: {}, right: {} }
        }),
            { Num, Var, Mul } = Expr

        const simplify = Trait(Expr, {
            _: (self) => self,
            Mul: [
                [{ left: Num(1) }, ({ right }) => right],
                [{ right: Num(1) }, ({ left }) => left],
                [{ left: Num(0) }, ({ left }) => left],
                [{ right: Num(0) }, ({ right }) => right]
            ]
        })

        const e1 = Mul(Var('x'), Num(1))

        expect(simplify(e1)).toEqual(Var('x'))

        const e2 = Mul(Num(1), Var('x'))

        expect(simplify(e2)).toEqual(Var('x'))

        const e3 = Mul(Num(0), Var('x'))

        expect(simplify(e3)).toEqual(Num(0))

        const e4 = Mul(Var('x'), Num(0))

        expect(simplify(e4)).toEqual(Num(0))

        const simplify2 = Trait(Expr, {
            _: (self) => self,
            Mul: [
                [Mul(Num(1), _), ({ right }) => right],
                [Mul(_, Num(1)), ({ left }) => left],
                [Mul(Num(0), _), ({ left }) => left],
                [Mul(_, Num(0)), ({ right }) => right]
            ]
        })

        expect(simplify2(e1)).toEqual(Var('x'))
        expect(simplify2(e2)).toEqual(Var('x'))
        expect(simplify2(e3)).toEqual(Num(0))
        expect(simplify2(e4)).toEqual(Num(0))
    })

    test('Notification', () => {
        const Notification = Data({
            Email: { sender: {}, title: {}, body: {} },
            SMS: { caller: {}, message: {} },
            VoiceRecording: { contactName: {}, link: {} }
        })
        const { Email, SMS, VoiceRecording } = Notification

        const showNotification = Trait(Notification, {
            Email: ({ sender, title, }) => `You got an email from ${sender} titled ${title}`,
            SMS: ({ caller, message }) => `You got a text message from ${caller} saying ${message}`,
            VoiceRecording: ({ contactName, link }) => `You received a voice recording from ${contactName}! Click the link to hear it: ${link}`
        })

        const sms = SMS('000-0000', 'Call me when you get a chance'),
            email = Email('Dad@example.com', 'Re: Dinner', 'Did you get my email?'),
            voiceRecording = VoiceRecording('Mom', 'https://example.com/voice-recording.mp4')

        expect(showNotification(sms)).toEqual('You got a text message from 000-0000 saying Call me when you get a chance')
        expect(showNotification(voiceRecording)).toEqual('You received a voice recording from Mom! Click the link to hear it: https://example.com/voice-recording.mp4')
        expect(showNotification(email)).toEqual('You got an email from Dad@example.com titled Re: Dinner')
    })

    test('List', () => {
        const List = Data({ Nil: {}, Cons: { head: {}, tail: {} } }),
            { Nil, Cons } = List

        const length = Trait(List, {
            Nil: (self) => 0,
            Cons: ({ tail }) => 1 + length(tail)
        })

        const l = Cons(1, Cons(2, Cons(3, Nil)))
        expect(length(l)).toEqual(3)

        const tell = Trait(List, {
            Nil: (self) => 'The list is empty',
            Cons: [
                [Cons(_, Nil), ({ head }) => `The list has one element: ${head}`],
                [Cons(_, Cons(_, Nil)), ({ head, tail }) => `The list has two elements: ${head} and ${tail.head}`],
                [Cons(_, Cons(_, _)), ({ head, tail }) => `This list is long. The first two elements are: ${head} and ${tail.head}`]
            ]
        })

        const l1 = Cons(1, Nil)
        expect(tell(l1)).toEqual('The list has one element: 1')

        const l2 = Cons(1, Cons(2, Nil))
        expect(tell(l2)).toEqual('The list has two elements: 1 and 2')

        const l3 = Cons(1, Cons(2, Cons(3, Nil)))
        expect(tell(l3)).toEqual('This list is long. The first two elements are: 1 and 2')

        const contains3 = Trait(List, {
            Nil: (self) => false,
            Cons: [
                [Cons(3, _), (self) => true],
                [Cons(_, _), ({ tail }) => contains3(tail)]
            ]
        })

        expect(contains3(l1)).toEqual(false)
        expect(contains3(l2)).toEqual(false)
        expect(contains3(l3)).toEqual(true)
    })
})