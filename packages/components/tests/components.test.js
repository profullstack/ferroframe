// Test framework: Mocha with Chai
import { expect } from 'chai';
import { Text, Box, Input, Button, List } from '../src/index.js';

describe('FerroFrame Components', () => {
  describe('Text Component', () => {
    it('should create a text component with content', () => {
      const text = Text({ children: 'Hello World' });
      
      expect(text.type).to.equal('text');
      expect(text.content).to.equal('Hello World');
    });

    it('should apply text styles', () => {
      const text = Text({ 
        children: 'Styled Text',
        color: 'red',
        bold: true,
        underline: true,
      });
      
      expect(text.style.color).to.equal('red');
      expect(text.style.bold).to.be.true;
      expect(text.style.underline).to.be.true;
    });

    it('should handle text alignment', () => {
      const text = Text({ 
        children: 'Centered',
        align: 'center',
        width: 20,
      });
      
      expect(text.style.align).to.equal('center');
      expect(text.style.width).to.equal(20);
    });
  });

  describe('Box Component', () => {
    it('should create a box container', () => {
      const box = Box({ 
        width: 100,
        height: 50,
      });
      
      expect(box.type).to.equal('box');
      expect(box.style.width).to.equal(100);
      expect(box.style.height).to.equal(50);
    });

    it('should support flexbox properties', () => {
      const box = Box({ 
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
      });
      
      expect(box.style.display).to.equal('flex');
      expect(box.style.flexDirection).to.equal('row');
      expect(box.style.justifyContent).to.equal('center');
      expect(box.style.alignItems).to.equal('center');
      expect(box.style.gap).to.equal(10);
    });

    it('should handle padding and margin', () => {
      const box = Box({ 
        padding: 10,
        margin: 5,
      });
      
      expect(box.style.padding).to.equal(10);
      expect(box.style.margin).to.equal(5);
    });

    it('should support borders', () => {
      const box = Box({ 
        border: 'single',
        borderColor: 'blue',
      });
      
      expect(box.style.border).to.equal('single');
      expect(box.style.borderColor).to.equal('blue');
    });

    it('should accept children', () => {
      const child1 = Text({ children: 'Child 1' });
      const child2 = Text({ children: 'Child 2' });
      
      const box = Box({ 
        children: [child1, child2],
      });
      
      expect(box.children).to.have.lengthOf(2);
      expect(box.children[0]).to.equal(child1);
      expect(box.children[1]).to.equal(child2);
    });
  });

  describe('Input Component', () => {
    it('should create an input field', () => {
      const input = Input({ 
        value: 'initial',
        placeholder: 'Enter text',
      });
      
      expect(input.type).to.equal('input');
      expect(input.value).to.equal('initial');
      expect(input.placeholder).to.equal('Enter text');
    });

    it('should handle focus state', () => {
      const input = Input({ 
        focused: true,
      });
      
      expect(input.focused).to.be.true;
    });

    it('should support input types', () => {
      const password = Input({ 
        type: 'password',
        value: 'secret',
      });
      
      expect(password.inputType).to.equal('password');
    });

    it('should handle onChange callback', () => {
      let changedValue = null;
      const input = Input({ 
        value: 'test',
        onChange: (value) => { changedValue = value; },
      });
      
      // Simulate change
      input.handleChange('new value');
      
      expect(changedValue).to.equal('new value');
    });
  });

  describe('Button Component', () => {
    it('should create a button', () => {
      const button = Button({ 
        children: 'Click Me',
      });
      
      expect(button.type).to.equal('button');
      expect(button.label).to.equal('Click Me');
    });

    it('should handle onClick callback', () => {
      let clicked = false;
      const button = Button({ 
        children: 'Test',
        onClick: () => { clicked = true; },
      });
      
      // Simulate click
      button.handleClick();
      
      expect(clicked).to.be.true;
    });

    it('should support disabled state', () => {
      const button = Button({ 
        children: 'Disabled',
        disabled: true,
      });
      
      expect(button.disabled).to.be.true;
    });

    it('should support button variants', () => {
      const primary = Button({ 
        children: 'Primary',
        variant: 'primary',
      });
      
      const secondary = Button({ 
        children: 'Secondary',
        variant: 'secondary',
      });
      
      expect(primary.variant).to.equal('primary');
      expect(secondary.variant).to.equal('secondary');
    });
  });

  describe('List Component', () => {
    it('should create a list with items', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const list = List({ items });
      
      expect(list.type).to.equal('list');
      expect(list.items).to.deep.equal(items);
    });

    it('should handle selected index', () => {
      const items = ['A', 'B', 'C'];
      const list = List({ 
        items,
        selectedIndex: 1,
      });
      
      expect(list.selectedIndex).to.equal(1);
    });

    it('should handle onSelect callback', () => {
      let selectedItem = null;
      let selectedIndex = null;
      
      const items = ['First', 'Second', 'Third'];
      const list = List({ 
        items,
        onSelect: (item, index) => {
          selectedItem = item;
          selectedIndex = index;
        },
      });
      
      // Simulate selection
      list.handleSelect(1);
      
      expect(selectedItem).to.equal('Second');
      expect(selectedIndex).to.equal(1);
    });

    it('should support custom item renderer', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      
      const list = List({ 
        items,
        renderItem: (item) => `${item.id}: ${item.name}`,
      });
      
      const rendered = list.renderItem(items[0]);
      expect(rendered).to.equal('1: Item 1');
    });

    it('should support scrollable lists', () => {
      const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      const list = List({ 
        items,
        height: 10,
        scrollable: true,
      });
      
      expect(list.scrollable).to.be.true;
      expect(list.style.height).to.equal(10);
    });
  });

  describe('Component Composition', () => {
    it('should compose components together', () => {
      const app = Box({
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        children: [
          Text({ children: 'Title', bold: true }),
          Box({
            display: 'flex',
            flexDirection: 'row',
            gap: 5,
            children: [
              Input({ placeholder: 'Enter name' }),
              Button({ children: 'Submit' }),
            ],
          }),
          List({ items: ['Option 1', 'Option 2'] }),
        ],
      });
      
      expect(app.type).to.equal('box');
      expect(app.children).to.have.lengthOf(3);
      expect(app.children[0].type).to.equal('text');
      expect(app.children[1].type).to.equal('box');
      expect(app.children[2].type).to.equal('list');
    });
  });
});