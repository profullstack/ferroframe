// Test framework: Mocha with Chai
import { expect } from 'chai';
import { FerroHost } from '../src/host.js';

describe('FerroHost', () => {
  let host;

  beforeEach(() => {
    host = new FerroHost();
  });

  afterEach(async () => {
    if (host?.isRunning) {
      await host.cleanup();
    }
  });

  describe('initialization', () => {
    it('should create a new FerroHost instance', () => {
      expect(host).to.be.instanceOf(FerroHost);
    });

    it('should not be running initially', () => {
      expect(host.isRunning).to.be.false;
    });

    it('should have an empty component tree', () => {
      expect(host.componentTree).to.be.null;
    });

    it('should accept configuration options', () => {
      const customHost = new FerroHost({
        fullscreen: true,
        mouse: true,
        title: 'Test App',
      });
      
      expect(customHost.config.fullscreen).to.be.true;
      expect(customHost.config.mouse).to.be.true;
      expect(customHost.config.title).to.equal('Test App');
    });
  });

  describe('mount', () => {
    it('should mount a component', async () => {
      const TestComponent = {
        name: 'TestComponent',
        render: () => 'Hello World',
      };

      await host.mount(TestComponent);
      
      expect(host.componentTree).to.not.be.null;
      expect(host.componentTree.name).to.equal('TestComponent');
    });

    it('should start the host when mounting', async () => {
      const TestComponent = {
        name: 'TestComponent',
        render: () => 'Hello',
      };

      await host.mount(TestComponent);
      
      expect(host.isRunning).to.be.true;
    });

    it('should throw error if already mounted', async () => {
      const Component1 = { name: 'Component1', render: () => 'C1' };
      const Component2 = { name: 'Component2', render: () => 'C2' };

      await host.mount(Component1);
      
      try {
        await host.mount(Component2);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('already mounted');
      }
    });
  });

  describe('unmount', () => {
    it('should unmount the component', async () => {
      const TestComponent = {
        name: 'TestComponent',
        render: () => 'Hello',
      };

      await host.mount(TestComponent);
      await host.unmount();
      
      expect(host.componentTree).to.be.null;
    });

    it('should call component cleanup if exists', async () => {
      let cleanupCalled = false;
      
      const TestComponent = {
        name: 'TestComponent',
        render: () => 'Hello',
        cleanup: () => {
          cleanupCalled = true;
        },
      };

      await host.mount(TestComponent);
      await host.unmount();
      
      expect(cleanupCalled).to.be.true;
    });
  });

  describe('render cycle', () => {
    it('should trigger render when component updates', async () => {
      let renderCount = 0;
      
      const TestComponent = {
        name: 'TestComponent',
        render: () => {
          renderCount++;
          return `Render ${renderCount}`;
        },
      };

      await host.mount(TestComponent);
      expect(renderCount).to.equal(1);
      
      await host.update();
      expect(renderCount).to.equal(2);
    });

    it('should handle render errors gracefully', async () => {
      const ErrorComponent = {
        name: 'ErrorComponent',
        render: () => {
          throw new Error('Render error');
        },
      };

      await host.mount(ErrorComponent);
      // Should not crash, but handle error
      expect(host.isRunning).to.be.true;
    });
  });

  describe('cleanup', () => {
    it('should stop the host', async () => {
      const TestComponent = {
        name: 'TestComponent',
        render: () => 'Hello',
      };

      await host.mount(TestComponent);
      await host.cleanup();
      
      expect(host.isRunning).to.be.false;
    });

    it('should restore terminal state', async () => {
      const TestComponent = {
        name: 'TestComponent',
        render: () => 'Hello',
      };

      await host.mount(TestComponent);
      const initialState = process.stdout.isTTY;
      
      await host.cleanup();
      
      expect(process.stdout.isTTY).to.equal(initialState);
    });
  });

  describe('event handling', () => {
    it('should register event listeners', () => {
      const handler = () => {};
      
      host.on('update', handler);
      
      expect(host.listeners('update')).to.include(handler);
    });

    it('should emit events', (done) => {
      host.on('test-event', (data) => {
        expect(data).to.equal('test-data');
        done();
      });

      host.emit('test-event', 'test-data');
    });

    it('should remove event listeners', () => {
      const handler = () => {};
      
      host.on('update', handler);
      host.off('update', handler);
      
      expect(host.listeners('update')).to.not.include(handler);
    });
  });
});