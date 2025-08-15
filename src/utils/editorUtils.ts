// Editor utility functions and configurations

export interface EditorCommandMap {
  [key: string]: () => void;
}

export class EditorController {
  private editor: any;
  private commands: EditorCommandMap = {};

  constructor(editor: any) {
    this.editor = editor;
    this.initializeCommands();
  }

  private initializeCommands() {
    // Text formatting commands
    this.commands.bold = () => this.editor.chain().focus().toggleBold().run();
    this.commands.italic = () => this.editor.chain().focus().toggleItalic().run();
    this.commands.underline = () => this.editor.chain().focus().toggleUnderline().run();
    this.commands.strike = () => this.editor.chain().focus().toggleStrike().run();
    this.commands.code = () => this.editor.chain().focus().toggleCode().run();

    // Heading commands
    this.commands.h1 = () => this.editor.chain().focus().toggleHeading({ level: 1 }).run();
    this.commands.h2 = () => this.editor.chain().focus().toggleHeading({ level: 2 }).run();
    this.commands.h3 = () => this.editor.chain().focus().toggleHeading({ level: 3 }).run();
    this.commands.h4 = () => this.editor.chain().focus().toggleHeading({ level: 4 }).run();

    // List commands
    this.commands.bulletList = () => this.editor.chain().focus().toggleBulletList().run();
    this.commands.orderedList = () => this.editor.chain().focus().toggleOrderedList().run();

    // Block commands
    this.commands.blockquote = () => this.editor.chain().focus().toggleBlockquote().run();
    this.commands.codeBlock = () => this.editor.chain().focus().toggleCodeBlock().run();
    this.commands.horizontalRule = () => this.editor.chain().focus().setHorizontalRule().run();

    // History commands
    this.commands.undo = () => this.editor.chain().focus().undo().run();
    this.commands.redo = () => this.editor.chain().focus().redo().run();
  }

  execute(command: string) {
    if (this.commands[command]) {
      this.commands[command]();
    }
  }

  updateToolbarState() {
    if (!this.editor) return;

    const activeStates = {
      'bold-btn': this.editor.isActive('bold'),
      'italic-btn': this.editor.isActive('italic'),
      'underline-btn': this.editor.isActive('underline'),
      'strike-btn': this.editor.isActive('strike'),
      'code-btn': this.editor.isActive('code'),
      'h1-btn': this.editor.isActive('heading', { level: 1 }),
      'h2-btn': this.editor.isActive('heading', { level: 2 }),
      'h3-btn': this.editor.isActive('heading', { level: 3 }),
      'h4-btn': this.editor.isActive('heading', { level: 4 }),
      'bullet-list-btn': this.editor.isActive('bulletList'),
      'ordered-list-btn': this.editor.isActive('orderedList'),
      'blockquote-btn': this.editor.isActive('blockquote'),
      'code-block-btn': this.editor.isActive('codeBlock'),
      'link-btn': this.editor.isActive('link'),
    };

    Object.entries(activeStates).forEach(([buttonId, isActive]) => {
      document.getElementById(buttonId)?.classList.toggle('active', isActive);
    });
  }

  showLinkDialog() {
    const url = prompt('Enter URL:');
    if (url) {
      if (this.editor.isActive('link')) {
        this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      } else {
        this.editor
          .chain()
          .focus()
          .insertContent(
            `[${this.editor.state.doc.textBetween(this.editor.state.selection.from, this.editor.state.selection.to)}](${url})`
          )
          .run();
      }
    }
  }

  showImageDialog() {
    const url = prompt('Enter image URL:');
    const alt = prompt('Enter alt text:');
    if (url) {
      this.editor
        .chain()
        .focus()
        .setImage({ src: url, alt: alt || '' })
        .run();
    }
  }
}

export function setupKeyboardShortcuts(controller: EditorController) {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          controller.execute('bold');
          break;
        case 'i':
          e.preventDefault();
          controller.execute('italic');
          break;
        case 'u':
          e.preventDefault();
          controller.execute('underline');
          break;
        case 'k':
          e.preventDefault();
          controller.showLinkDialog();
          break;
      }
    }
  });
}

export function createEventHandlers(controller: EditorController) {
  const handlers: Record<string, () => void> = {
    'bold-btn': () => controller.execute('bold'),
    'italic-btn': () => controller.execute('italic'),
    'underline-btn': () => controller.execute('underline'),
    'strike-btn': () => controller.execute('strike'),
    'code-btn': () => controller.execute('code'),
    'h1-btn': () => controller.execute('h1'),
    'h2-btn': () => controller.execute('h2'),
    'h3-btn': () => controller.execute('h3'),
    'h4-btn': () => controller.execute('h4'),
    'bullet-list-btn': () => controller.execute('bulletList'),
    'ordered-list-btn': () => controller.execute('orderedList'),
    'blockquote-btn': () => controller.execute('blockquote'),
    'code-block-btn': () => controller.execute('codeBlock'),
    'horizontal-rule-btn': () => controller.execute('horizontalRule'),
    'link-btn': () => controller.showLinkDialog(),
    'image-btn': () => controller.showImageDialog(),
    'undo-btn': () => controller.execute('undo'),
    'redo-btn': () => controller.execute('redo'),
  };

  Object.entries(handlers).forEach(([buttonId, handler]) => {
    document.getElementById(buttonId)?.addEventListener('click', handler);
  });
}

export async function createTipTapEditor(element: HTMLElement, contentTextarea: HTMLTextAreaElement) {
  // Dynamically import modules
  const { Editor } = await import('@tiptap/core');
  const StarterKit = await import('@tiptap/starter-kit');
  const Typography = await import('@tiptap/extension-typography');
  const Placeholder = await import('@tiptap/extension-placeholder');
  const Underline = await import('@tiptap/extension-underline');
  const Link = await import('@tiptap/extension-link');
  const Image = await import('@tiptap/extension-image');
  const { marked } = await import('marked');
  const TurndownService = await import('turndown');

  // Import markdown utilities
  const { preprocessMarkdownContent, configureMarked } = await import('../utils/markdown');

  // Configure markdown parser
  configureMarked(marked);

  // Configure HTML to Markdown converter
  const turndownService = new TurndownService.default({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  // Convert markdown content to HTML for editor initialization
  const markdownContent = contentTextarea.value;
  const processedContent = preprocessMarkdownContent(markdownContent);
  const htmlContent = await marked(processedContent);

  // Initialize Tiptap editor with enhanced extensions
  const editor = new Editor({
    element,
    extensions: [
      StarterKit.default.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: { HTMLAttributes: { class: 'language-markdown' } },
      }),
      Typography.default,
      Placeholder.default.configure({ placeholder: 'Write your post content...' }),
      Underline.default,
      Link.default.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'cursor-pointer' },
      }),
      Image.default.configure({
        HTMLAttributes: { class: 'max-w-full h-auto' },
      }),
    ],
    content: htmlContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      // Convert HTML to Markdown using turndown
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      contentTextarea.value = markdown;
    },
  });

  return { editor, controller: new EditorController(editor) };
}
