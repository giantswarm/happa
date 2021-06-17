import {
  AssignmentExpression,
  ClassDeclaration,
  Declaration,
  Expression,
  ExpressionStatement,
  ImportDeclaration,
  Module,
  Program,
} from '@swc/core';

class PropTypesStripper {
  public visitProgram(n: Program): Program {
    switch (n.type) {
      case 'Module':
        return this.visitModule(n);
      default:
        return n;
    }
  }

  public visitModule(n: Module): Module {
    n.body = n.body.map((member) => {
      switch (member.type) {
        case 'ClassDeclaration':
          return this.visitClassDeclaration(member);
        case 'ImportDeclaration':
          return this.visitImportDeclaration(member);
        case 'ExpressionStatement':
          return this.visitExpressionStatement(member);
        default:
          return member;
      }
    });

    return n;
  }

  public visitAssignmentExpression(n: AssignmentExpression): Expression {
    if (
      n.operator === '=' &&
      n.left.type === 'MemberExpression' &&
      n.left.object.type === 'Identifier' &&
      n.left.property.type === 'Identifier' &&
      n.left.property.value === 'propTypes'
    ) {
      return {
        type: 'UnaryExpression',
        span: n.span,
        operator: 'void',
        argument: {
          type: 'NumericLiteral',
          span: n.span,
          value: 0,
        },
      };
    }

    return n;
  }

  public visitClassDeclaration(n: ClassDeclaration): Declaration {
    n.body = n.body.filter((member) => {
      if (
        member.type === 'ClassProperty' &&
        // @ts-expect-error
        member.isStatic &&
        member.key.type === 'Identifier' &&
        member.key.value === 'propTypes'
      ) {
        return false;
      }

      return true;
    });

    return n;
  }

  public visitImportDeclaration(n: ImportDeclaration): ImportDeclaration {
    if (n.source.value === 'prop-types') {
      return ({
        type: 'EmptyStatement',
        span: n.span,
      } as unknown) as ImportDeclaration;
    }

    return n;
  }

  public visitExpressionStatement(n: ExpressionStatement): ExpressionStatement {
    n.expression = this.visitExpression(n.expression);

    return n;
  }

  public visitExpression(n: Expression): Expression {
    switch (n.type) {
      case 'AssignmentExpression':
        return this.visitAssignmentExpression(n);
      default:
        return n;
    }
  }
}

export default PropTypesStripper;
