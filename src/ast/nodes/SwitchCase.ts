import MagicString from 'magic-string';
import {
	findFirstOccurrenceOutsideComment,
	RenderOptions,
	renderStatementList
} from '../../utils/renderHelpers';
import { ExecutionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase, StatementNode } from './shared/Node';

export default class SwitchCase extends NodeBase {
	consequent!: StatementNode[];
	test!: ExpressionNode | null;
	type!: NodeType.tSwitchCase;

	include(includeChildrenRecursively: IncludeChildren, context: ExecutionContext) {
		this.included = true;
		if (this.test) this.test.include(includeChildrenRecursively, context);
		for (const node of this.consequent) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context))
				node.include(includeChildrenRecursively, context);
		}
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.consequent.length) {
			this.test && this.test.render(code, options);
			const testEnd = this.test
				? this.test.end
				: findFirstOccurrenceOutsideComment(code.original, 'default', this.start) + 7;
			const consequentStart = findFirstOccurrenceOutsideComment(code.original, ':', testEnd) + 1;
			renderStatementList(this.consequent, code, consequentStart, this.end, options);
		} else {
			super.render(code, options);
		}
	}
}
