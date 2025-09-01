// Test framework: Mocha with Chai
import { expect } from 'chai';
import { Layout, LayoutNode } from '../src/layout.js';

describe('Layout System', () => {
  describe('LayoutNode', () => {
    it('should create a layout node with default properties', () => {
      const node = new LayoutNode();
      
      expect(node.x).to.equal(0);
      expect(node.y).to.equal(0);
      expect(node.width).to.equal(0);
      expect(node.height).to.equal(0);
      expect(node.children).to.be.an('array').that.is.empty;
    });

    it('should accept style properties', () => {
      const node = new LayoutNode({
        width: 100,
        height: 50,
        padding: 10,
        margin: 5,
      });
      
      expect(node.style.width).to.equal(100);
      expect(node.style.height).to.equal(50);
      expect(node.style.padding).to.equal(10);
      expect(node.style.margin).to.equal(5);
    });

    it('should add child nodes', () => {
      const parent = new LayoutNode();
      const child1 = new LayoutNode();
      const child2 = new LayoutNode();
      
      parent.appendChild(child1);
      parent.appendChild(child2);
      
      expect(parent.children).to.have.lengthOf(2);
      expect(child1.parent).to.equal(parent);
      expect(child2.parent).to.equal(parent);
    });

    it('should remove child nodes', () => {
      const parent = new LayoutNode();
      const child = new LayoutNode();
      
      parent.appendChild(child);
      parent.removeChild(child);
      
      expect(parent.children).to.be.empty;
      expect(child.parent).to.be.null;
    });
  });

  describe('Layout Engine', () => {
    let layout;

    beforeEach(() => {
      layout = new Layout();
    });

    describe('Box Model', () => {
      it('should calculate content box with padding', () => {
        const node = new LayoutNode({
          width: 100,
          height: 50,
          padding: 10,
        });
        
        const contentBox = layout.getContentBox(node);
        
        expect(contentBox.width).to.equal(80); // 100 - 10*2
        expect(contentBox.height).to.equal(30); // 50 - 10*2
      });

      it('should handle padding as object', () => {
        const node = new LayoutNode({
          width: 100,
          height: 50,
          padding: { top: 5, right: 10, bottom: 15, left: 20 },
        });
        
        const contentBox = layout.getContentBox(node);
        
        expect(contentBox.width).to.equal(70); // 100 - 10 - 20
        expect(contentBox.height).to.equal(30); // 50 - 5 - 15
        expect(contentBox.x).to.equal(20); // left padding
        expect(contentBox.y).to.equal(5); // top padding
      });

      it('should apply margin spacing', () => {
        const node = new LayoutNode({
          width: 100,
          height: 50,
          margin: 10,
        });
        
        const outerBox = layout.getOuterBox(node);
        
        expect(outerBox.width).to.equal(120); // 100 + 10*2
        expect(outerBox.height).to.equal(70); // 50 + 10*2
      });
    });

    describe('Flexbox Layout', () => {
      it('should layout children in row direction', () => {
        const container = new LayoutNode({
          width: 300,
          height: 100,
          display: 'flex',
          flexDirection: 'row',
        });
        
        const child1 = new LayoutNode({ width: 50, height: 30 });
        const child2 = new LayoutNode({ width: 70, height: 40 });
        const child3 = new LayoutNode({ width: 60, height: 35 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        container.appendChild(child3);
        
        layout.calculate(container);
        
        expect(child1.x).to.equal(0);
        expect(child2.x).to.equal(50);
        expect(child3.x).to.equal(120);
        expect(child1.y).to.equal(0);
        expect(child2.y).to.equal(0);
        expect(child3.y).to.equal(0);
      });

      it('should layout children in column direction', () => {
        const container = new LayoutNode({
          width: 100,
          height: 200,
          display: 'flex',
          flexDirection: 'column',
        });
        
        const child1 = new LayoutNode({ width: 50, height: 30 });
        const child2 = new LayoutNode({ width: 70, height: 40 });
        const child3 = new LayoutNode({ width: 60, height: 35 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        container.appendChild(child3);
        
        layout.calculate(container);
        
        expect(child1.y).to.equal(0);
        expect(child2.y).to.equal(30);
        expect(child3.y).to.equal(70);
        expect(child1.x).to.equal(0);
        expect(child2.x).to.equal(0);
        expect(child3.x).to.equal(0);
      });

      it('should handle flex grow property', () => {
        const container = new LayoutNode({
          width: 300,
          height: 100,
          display: 'flex',
          flexDirection: 'row',
        });
        
        const child1 = new LayoutNode({ width: 50, flexGrow: 1 });
        const child2 = new LayoutNode({ width: 50, flexGrow: 2 });
        const child3 = new LayoutNode({ width: 50 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        container.appendChild(child3);
        
        layout.calculate(container);
        
        // Available space: 300 - 150 = 150
        // child1 gets 1/3 = 50, child2 gets 2/3 = 100
        expect(child1.width).to.equal(100); // 50 + 50
        expect(child2.width).to.equal(150); // 50 + 100
        expect(child3.width).to.equal(50);
      });

      it('should handle justify-content: center', () => {
        const container = new LayoutNode({
          width: 300,
          height: 100,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        });
        
        const child1 = new LayoutNode({ width: 50, height: 30 });
        const child2 = new LayoutNode({ width: 50, height: 30 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        
        layout.calculate(container);
        
        // Total children width: 100, container: 300, offset: 100
        expect(child1.x).to.equal(100);
        expect(child2.x).to.equal(150);
      });

      it('should handle justify-content: space-between', () => {
        const container = new LayoutNode({
          width: 300,
          height: 100,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        });
        
        const child1 = new LayoutNode({ width: 50, height: 30 });
        const child2 = new LayoutNode({ width: 50, height: 30 });
        const child3 = new LayoutNode({ width: 50, height: 30 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        container.appendChild(child3);
        
        layout.calculate(container);
        
        expect(child1.x).to.equal(0);
        expect(child2.x).to.equal(125); // (300 - 150) / 2 + 50
        expect(child3.x).to.equal(250); // 300 - 50
      });

      it('should handle align-items: center', () => {
        const container = new LayoutNode({
          width: 300,
          height: 100,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        });
        
        const child1 = new LayoutNode({ width: 50, height: 30 });
        const child2 = new LayoutNode({ width: 50, height: 50 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        
        layout.calculate(container);
        
        expect(child1.y).to.equal(35); // (100 - 30) / 2
        expect(child2.y).to.equal(25); // (100 - 50) / 2
      });

      it('should handle gap between items', () => {
        const container = new LayoutNode({
          width: 300,
          height: 100,
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
        });
        
        const child1 = new LayoutNode({ width: 50, height: 30 });
        const child2 = new LayoutNode({ width: 50, height: 30 });
        const child3 = new LayoutNode({ width: 50, height: 30 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        container.appendChild(child3);
        
        layout.calculate(container);
        
        expect(child1.x).to.equal(0);
        expect(child2.x).to.equal(60); // 50 + 10
        expect(child3.x).to.equal(120); // 50 + 10 + 50 + 10
      });

      it('should wrap items when flex-wrap is enabled', () => {
        const container = new LayoutNode({
          width: 100,
          height: 100,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
        });
        
        const child1 = new LayoutNode({ width: 60, height: 30 });
        const child2 = new LayoutNode({ width: 60, height: 30 });
        
        container.appendChild(child1);
        container.appendChild(child2);
        
        layout.calculate(container);
        
        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);
        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(30); // Wrapped to next line
      });
    });

    describe('Size Constraints', () => {
      it('should respect min-width and min-height', () => {
        const node = new LayoutNode({
          width: 50,
          height: 30,
          minWidth: 100,
          minHeight: 60,
        });
        
        layout.applyConstraints(node);
        
        expect(node.width).to.equal(100);
        expect(node.height).to.equal(60);
      });

      it('should respect max-width and max-height', () => {
        const node = new LayoutNode({
          width: 200,
          height: 150,
          maxWidth: 100,
          maxHeight: 80,
        });
        
        layout.applyConstraints(node);
        
        expect(node.width).to.equal(100);
        expect(node.height).to.equal(80);
      });

      it('should handle percentage widths', () => {
        const container = new LayoutNode({
          width: 200,
          height: 100,
        });
        
        const child = new LayoutNode({
          width: '50%',
          height: '75%',
        });
        
        container.appendChild(child);
        layout.calculate(container);
        
        expect(child.width).to.equal(100); // 50% of 200
        expect(child.height).to.equal(75); // 75% of 100
      });
    });
  });
});