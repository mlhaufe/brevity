import { complect, data, trait, _ } from "../index.mjs";

describe('Pattern matching', () => {
    test('Simplify expression', () => {
        const exprData = data({
            Num: { value: {} },
            Var: { name: {} },
            Mul: { left: {}, right: {} }
        })

        const simplify1 = trait(exprData, {
            _: (self) => self,
            Mul: [
                // [{ left: Num(1) }, ({ right }) => right],
                // [{ right: Num(1) }, ({ left }) => left],
                // [{ left: Num(0) }, ({ left }) => left],
                // [{ right: Num(0) }, ({ right }) => right]
                (self = { left: Number(1) }) => self.right,
                (self = { right: Number(1) }) => self.left,
                (self = { left: Number(0) }) => self.left,
                (self = { right: Number(0) }) => self.right
            ]
        })

        const simplify2 = trait(exprData, {
            _: (self) => self,
            Mul: [
                // [Mul(Num(1), _), ({ right }) => right],
                // [Mul(_, Num(1)), ({ left }) => left],
                // [Mul(Num(0), _), ({ left }) => left],
                // [Mul(_, Num(0)), ({ right }) => right]
                (self = Mul(Num(1), _)) => self.right,
                (self = Mul(_, Num(1))) => self.left,
                (self = Mul(Num(0), _)) => self.left,
                (self = Mul(_, Num(0))) => self.right
            ]
        })

        const expr = complect(exprData, { simplify1, simplify2 }),
            { Num, Var, Mul } = expr

        const e1 = Mul(Var('x'), Num(1))

        expect(e1.simplify1()).toEqual(Var('x'))
        expect(e1.simplify2()).toEqual(Var('x'))

        const e2 = Mul(Num(1), Var('x'))

        expect(e2.simplify1()).toEqual(Var('x'))
        expect(e2.simplify2()).toEqual(Var('x'))

        const e3 = Mul(Num(0), Var('x'))

        expect(e3.simplify1()).toEqual(Num(0))
        expect(e3.simplify2()).toEqual(Num(0))

        const e4 = Mul(Var('x'), Num(0))

        expect(e4.simplify1()).toEqual(Num(0))
        expect(e4.simplify2()).toEqual(Num(0))
    })

    test('Notification', () => {
        const notificationData = data({
            Email: { sender: {}, title: {}, body: {} },
            SMS: { caller: {}, message: {} },
            VoiceRecording: { contactName: {}, link: {} }
        })

        const showNotification = trait(notificationData, {
            Email: ({ sender, title, }) => `You got an email from ${sender} titled ${title}`,
            SMS: ({ caller, message }) => `You got a text message from ${caller} saying ${message}`,
            VoiceRecording: ({ contactName, link }) => `You received a voice recording from ${contactName}! Click the link to hear it: ${link}`
        })

        const notification = complect(notificationData, { showNotification }),
            { Email, SMS, VoiceRecording } = notification

        const sms = SMS('000-0000', 'Call me when you get a chance'),
            email = Email('Dad@example.com', 'Re: Dinner', 'Did you get my email?'),
            voiceRecording = VoiceRecording('Mom', 'https://example.com/voice-recording.mp4')

        expect(sms.showNotification()).toEqual('You got a text message from 000-0000 saying Call me when you get a chance')
        expect(voiceRecording.showNotification()).toEqual('You received a voice recording from Mom! Click the link to hear it: https://example.com/voice-recording.mp4')
        expect(email.showNotification()).toEqual('You got an email from Dad@example.com titled Re: Dinner')
    })

    test('List', () => {
        const listData = data({ Nil: {}, Cons: { head: {}, tail: {} } })

        const length = trait(listData, {
            Nil: (self) => 0,
            Cons: ({ tail }) => 1 + length(tail)
        })

        const tell = trait(listData, {
            Nil: (self) => 'The list is empty',
            Cons: [
                // [Cons(_, Nil), ({ head }) => `The list has one element: ${head}`],
                // [Cons(_, Cons(_, Nil)), ({ head, tail }) => `The list has two elements: ${head} and ${tail.head}`],
                // [Cons(_, Cons(_, _)), ({ head, tail }) => `This list is long. The first two elements are: ${head} and ${tail.head}`]
                (self = Cons(_, Nil)) => `The list has one element: ${self.head}`,
                (self = Cons(_, Cons(_, Nil))) => `The list has two elements: ${self.head} and ${self.tail.head}`,
                (self = Cons(_, Cons(_, _))) => `This list is long. The first two elements are: ${self.head} and ${self.tail.head}`
            ]
        })

        const contains3 = trait(listData, {
            Nil: (self) => false,
            Cons: [
                // [Cons(3, _), (self) => true],
                // [Cons(_, _), ({ tail }) => contains3(tail)]
                (self = Cons(3, _)) => true,
                (self = Cons(_, _)) => contains3(self.tail)
            ]
        })

        const list = complect(listData, { contains3, length, tell }),
            { Nil, Cons } = list

        const l = Cons(1, Cons(2, Cons(3, Nil)))
        expect(l.length()).toEqual(3)

        const l1 = Cons(1, Nil)
        expect(l1.tell()).toEqual('The list has one element: 1')

        const l2 = Cons(1, Cons(2, Nil))
        expect(l2.tell()).toEqual('The list has two elements: 1 and 2')

        const l3 = Cons(1, Cons(2, Cons(3, Nil)))
        expect(l3.tell()).toEqual('This list is long. The first two elements are: 1 and 2')

        expect(l1.contains3()).toEqual(false)
        expect(l2.contains3()).toEqual(false)
        expect(l3.contains3()).toEqual(true)
    })
})