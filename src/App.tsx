import { useState, useRef, useEffect } from 'react';

type BlockType = 'text' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'todo' | 'divider' | 'callout';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  emoji?: string;
}

const initialBlocks: Block[] = [
  { id: '1', type: 'heading1', content: 'Hello, World' },
  { id: '2', type: 'text', content: 'Welcome to your new workspace. This is a Notion-style hello world app.' },
  { id: '3', type: 'divider', content: '' },
  { id: '4', type: 'heading2', content: 'Getting Started' },
  { id: '5', type: 'callout', content: 'Click on any block to edit. Type / for commands.', emoji: '💡' },
  { id: '6', type: 'bullet', content: 'Click anywhere to start typing' },
  { id: '7', type: 'bullet', content: 'Press Enter to create a new block' },
  { id: '8', type: 'bullet', content: 'Hover over blocks to see options' },
  { id: '9', type: 'divider', content: '' },
  { id: '10', type: 'heading3', content: 'Your Tasks' },
  { id: '11', type: 'todo', content: 'Explore this workspace', checked: true },
  { id: '12', type: 'todo', content: 'Create your first page', checked: false },
  { id: '13', type: 'todo', content: 'Share with teammates', checked: false },
  { id: '14', type: 'text', content: '' },
];

function App() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));

    if (content === '/') {
      setShowSlashMenu(true);
      setSlashMenuBlockId(id);
    } else {
      setShowSlashMenu(false);
      setSlashMenuBlockId(null);
    }
  };

  const toggleTodo = (id: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, checked: !b.checked } : b));
  };

  const addBlockAfter = (id: string, type: BlockType = 'text') => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      checked: type === 'todo' ? false : undefined,
      emoji: type === 'callout' ? '📝' : undefined
    };
    const index = blocks.findIndex(b => b.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);

    setTimeout(() => {
      inputRefs.current[newBlock.id]?.focus();
    }, 10);
  };

  const changeBlockType = (id: string, newType: BlockType) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        return {
          ...b,
          type: newType,
          content: '',
          checked: newType === 'todo' ? false : undefined,
          emoji: newType === 'callout' ? '📝' : undefined
        };
      }
      return b;
    }));
    setShowSlashMenu(false);
    setSlashMenuBlockId(null);
    setTimeout(() => {
      inputRefs.current[id]?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlockAfter(block.id);
    }
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
      setSlashMenuBlockId(null);
    }
  };

  const deleteBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  useEffect(() => {
    if (focusedBlock && inputRefs.current[focusedBlock]) {
      inputRefs.current[focusedBlock]?.focus();
    }
  }, [focusedBlock]);

  const slashCommands = [
    { type: 'text' as BlockType, label: 'Text', icon: 'Aa', desc: 'Just start writing with plain text' },
    { type: 'heading1' as BlockType, label: 'Heading 1', icon: 'H1', desc: 'Big section heading' },
    { type: 'heading2' as BlockType, label: 'Heading 2', icon: 'H2', desc: 'Medium section heading' },
    { type: 'heading3' as BlockType, label: 'Heading 3', icon: 'H3', desc: 'Small section heading' },
    { type: 'bullet' as BlockType, label: 'Bulleted list', icon: '•', desc: 'Create a simple bulleted list' },
    { type: 'todo' as BlockType, label: 'To-do list', icon: '☐', desc: 'Track tasks with a to-do list' },
    { type: 'callout' as BlockType, label: 'Callout', icon: '💡', desc: 'Make writing stand out' },
    { type: 'divider' as BlockType, label: 'Divider', icon: '—', desc: 'Visually divide blocks' },
  ];

  const renderBlock = (block: Block) => {
    const isHovered = hoveredBlock === block.id;
    const isFocused = focusedBlock === block.id;

    const commonProps = {
      ref: (el: HTMLElement | null) => { inputRefs.current[block.id] = el; },
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLElement>) => updateBlockContent(block.id, e.currentTarget.textContent || ''),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block),
      onFocus: () => setFocusedBlock(block.id),
      onBlur: () => setFocusedBlock(null),
    };

    const wrapperClasses = `group relative transition-all duration-150 ${isHovered || isFocused ? 'bg-notion-hover' : ''}`;

    const blockHandle = (
      <div className={`absolute -left-8 md:-left-10 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button
          onClick={() => addBlockAfter(block.id)}
          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-notion-gray hover:bg-notion-hover rounded transition-colors"
          title="Add block"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="md:w-4 md:h-4">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => deleteBlock(block.id)}
          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-notion-gray hover:bg-notion-hover rounded cursor-grab active:cursor-grabbing transition-colors"
          title="Drag or delete"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="md:w-3.5 md:h-3.5">
            <circle cx="3" cy="3" r="1" fill="currentColor"/>
            <circle cx="3" cy="6" r="1" fill="currentColor"/>
            <circle cx="3" cy="9" r="1" fill="currentColor"/>
            <circle cx="6" cy="3" r="1" fill="currentColor"/>
            <circle cx="6" cy="6" r="1" fill="currentColor"/>
            <circle cx="6" cy="9" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
    );

    switch (block.type) {
      case 'heading1':
        return (
          <div
            className={`${wrapperClasses} py-1`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <h1
              {...commonProps}
              className="text-2xl md:text-4xl font-bold text-notion-text outline-none font-serif leading-tight"
            >
              {block.content}
            </h1>
          </div>
        );

      case 'heading2':
        return (
          <div
            className={`${wrapperClasses} py-1 mt-4`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <h2
              {...commonProps}
              className="text-xl md:text-2xl font-semibold text-notion-text outline-none font-serif"
            >
              {block.content}
            </h2>
          </div>
        );

      case 'heading3':
        return (
          <div
            className={`${wrapperClasses} py-1 mt-3`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <h3
              {...commonProps}
              className="text-lg md:text-xl font-semibold text-notion-text outline-none font-serif"
            >
              {block.content}
            </h3>
          </div>
        );

      case 'bullet':
        return (
          <div
            className={`${wrapperClasses} py-0.5 flex items-start gap-2`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <span className="text-notion-text mt-0.5 select-none">•</span>
            <p
              {...commonProps}
              className="flex-1 text-base md:text-lg text-notion-text outline-none leading-relaxed"
            >
              {block.content}
            </p>
          </div>
        );

      case 'todo':
        return (
          <div
            className={`${wrapperClasses} py-0.5 flex items-start gap-2`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <button
              onClick={() => toggleTodo(block.id)}
              className={`w-5 h-5 md:w-4 md:h-4 mt-1 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                block.checked
                  ? 'bg-notion-blue border-notion-blue'
                  : 'border-notion-gray hover:border-notion-blue'
              }`}
            >
              {block.checked && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <p
              {...commonProps}
              className={`flex-1 text-base md:text-lg outline-none leading-relaxed transition-all ${
                block.checked ? 'text-notion-gray line-through' : 'text-notion-text'
              }`}
            >
              {block.content}
            </p>
          </div>
        );

      case 'callout':
        return (
          <div
            className={`${wrapperClasses} py-1`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <div className="bg-notion-callout rounded-md p-3 md:p-4 flex items-start gap-2 md:gap-3">
              <span className="text-lg md:text-xl select-none flex-shrink-0">{block.emoji}</span>
              <p
                {...commonProps}
                className="flex-1 text-base md:text-lg text-notion-text outline-none leading-relaxed"
              >
                {block.content}
              </p>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div
            className={`${wrapperClasses} py-2`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <hr className="border-t border-notion-border" />
          </div>
        );

      default:
        return (
          <div
            className={`${wrapperClasses} py-0.5`}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
          >
            {blockHandle}
            <p
              {...commonProps}
              className="text-base md:text-lg text-notion-text outline-none leading-relaxed min-h-[1.75em]"
              data-placeholder="Type '/' for commands..."
            >
              {block.content}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-notion-bg flex flex-col">
      {/* Sidebar indicator */}
      <div className="fixed left-0 top-0 w-1 h-full bg-gradient-to-b from-notion-blue/20 via-notion-blue/10 to-transparent hidden md:block" />

      {/* Top bar */}
      <header className="sticky top-0 bg-notion-bg/80 backdrop-blur-sm border-b border-notion-border/50 px-4 md:px-6 py-2 md:py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-notion-text/10 rounded flex items-center justify-center">
            <span className="text-xs md:text-sm">📄</span>
          </div>
          <span className="text-notion-text font-medium text-sm md:text-base">Hello World</span>
          <span className="text-notion-gray text-xs hidden md:inline">Edited just now</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button className="px-2 md:px-3 py-1.5 md:py-1 text-xs md:text-sm text-notion-gray hover:bg-notion-hover rounded transition-colors">
            Share
          </button>
          <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-notion-gray hover:bg-notion-hover rounded transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="md:w-5 md:h-5">
              <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-8 md:py-16 pl-10 md:pl-12 pr-2 md:pr-4">
          {/* Page icon and title area */}
          <div className="mb-4 md:mb-8">
            <div className="text-5xl md:text-7xl mb-3 md:mb-4 hover:bg-notion-hover w-fit p-1 md:p-2 rounded cursor-pointer transition-colors -ml-1 md:-ml-2">
              👋
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-0.5">
            {blocks.map(block => (
              <div key={block.id} className="relative">
                {renderBlock(block)}

                {/* Slash command menu */}
                {showSlashMenu && slashMenuBlockId === block.id && (
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-notion-border py-2 w-64 md:w-72 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 text-xs text-notion-gray font-medium uppercase tracking-wider">
                      Basic blocks
                    </div>
                    {slashCommands.map(cmd => (
                      <button
                        key={cmd.type}
                        onClick={() => changeBlockType(block.id, cmd.type)}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-notion-hover transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-notion-bg rounded border border-notion-border flex items-center justify-center text-notion-text font-medium">
                          {cmd.icon}
                        </div>
                        <div>
                          <div className="text-sm text-notion-text">{cmd.label}</div>
                          <div className="text-xs text-notion-gray">{cmd.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add block hint */}
          <div
            className="mt-4 py-2 text-notion-gray/50 hover:text-notion-gray cursor-text transition-colors text-sm md:text-base"
            onClick={() => addBlockAfter(blocks[blocks.length - 1].id)}
          >
            Click here or press Enter to add a new block...
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 md:py-6 text-center border-t border-notion-border/30">
        <p className="text-xs text-notion-gray/60">
          Requested by <span className="text-notion-gray/80">@web-user</span> · Built by <span className="text-notion-gray/80">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
