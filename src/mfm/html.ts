const jsdom = require('jsdom');
const { JSDOM } = jsdom;
import config from '../config';
import { INote } from '../models/note';
import { Node } from './parser';
import { intersperse } from '../prelude/array';

export default (tokens: Node[], mentionedRemoteUsers: INote['mentionedRemoteUsers'] = []) => {
	if (tokens == null) {
		return null;
	}

	const { window } = new JSDOM('');

	const doc = window.document;

	function appendChildren(children: Node[], targetElement: any): void {
		for (const child of children.map(n => handlers[n.name](n))) targetElement.appendChild(child);
	}

	const handlers: { [key: string]: (token: Node) => any } = {
		bold(token) {
			const el = doc.createElement('b');
			appendChildren(token.children, el);
			return el;
		},

		big(token) {
			const el = doc.createElement('strong');
			appendChildren(token.children, el);
			return el;
		},

		small(token) {
			const el = doc.createElement('small');
			appendChildren(token.children, el);
			return el;
		},

		strike(token) {
			const el = doc.createElement('del');
			appendChildren(token.children, el);
			return el;
		},

		italic(token) {
			const el = doc.createElement('i');
			appendChildren(token.children, el);
			return el;
		},

		motion(token) {
			const el = doc.createElement('i');
			appendChildren(token.children, el);
			return el;
		},

		blockCode(token) {
			const pre = doc.createElement('pre');
			const inner = doc.createElement('code');
			inner.innerHTML = token.props.code;
			pre.appendChild(inner);
			return pre;
		},

		center(token) {
			const el = doc.createElement('div');
			appendChildren(token.children, el);
			return el;
		},

		emoji(token) {
			return doc.createTextNode(token.props.emoji ? token.props.emoji : `:${token.props.name}:`);
		},

		hashtag(token) {
			const a = doc.createElement('a');
			a.href = `${config.url}/tags/${token.props.hashtag}`;
			a.textContent = `#${token.props.hashtag}`;
			a.setAttribute('rel', 'tag');
			return a;
		},

		inlineCode(token) {
			const el = doc.createElement('code');
			el.textContent = token.props.code;
			return el;
		},

		math(token) {
			const el = doc.createElement('code');
			el.textContent = token.props.formula;
			return el;
		},

		link(token) {
			const a = doc.createElement('a');
			a.href = token.props.url;
			appendChildren(token.children, a);
			return a;
		},

		mention(token) {
			const a = doc.createElement('a');
			const { username, host, acct } = token.props;
			switch (host) {
				case 'github.com':
					a.href = `https://github.com/${username}`;
					break;
				case 'twitter.com':
					a.href = `https://twitter.com/${username}`;
					break;
				default:
					const remoteUserInfo = mentionedRemoteUsers.find(remoteUser => remoteUser.username === username && remoteUser.host === host);
					a.href = remoteUserInfo ? remoteUserInfo.uri : `${config.url}/${acct}`;
					break;
			}
			a.textContent = acct;
			return a;
		},

		quote(token) {
			const el = doc.createElement('blockquote');
			appendChildren(token.children, el);
			return el;
		},

		title(token) {
			const el = doc.createElement('h1');
			appendChildren(token.children, el);
			return el;
		},

		text(token) {
			const el = doc.createElement('span');
			const nodes = (token.props.text as string).split('\n').map(x => doc.createTextNode(x));

			for (const x of intersperse('br', nodes)) {
				el.appendChild(x === 'br' ? doc.createElement('br') : x);
			}

			return el;
		},

		url(token) {
			const a = doc.createElement('a');
			a.href = token.props.url;
			a.textContent = token.props.url;
			return a;
		},

		search(token) {
			const a = doc.createElement('a');
			a.href = `https://www.google.com/?#q=${token.props.query}`;
			a.textContent = token.props.content;
			return a;
		}
	};

	appendChildren(tokens, doc.body);

	return `<p>${doc.body.innerHTML}</p>`;
};
