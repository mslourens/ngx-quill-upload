import Styled from './Styled';
import { Constants, Helpers } from '../utils';

interface Range {
  index: number;
  length: number;
}

export interface Options {
  accepts: string[];
  upload(file: File): Promise<string>;
}

class BaseHandler {
  quill: any;
  options: Options;
  range: Range | null;
  handler: string;
  fileHolder: HTMLInputElement;
  handlerId: string;
  helpers = new Helpers();
  allowedFormatRegex: RegExp;
  possibleExtension: Set<string>;

  get loading(): HTMLElement {
    return document.getElementById(
        `${Constants.ID_SPLIT_FLAG}.QUILL-LOADING`
    );
  }

  constructor(quill, options: Options) {
    this.quill = quill;
    this.options = options;
    this.range = null;

    new Styled().apply();

    if (this.loading == null) {
      const node = document.createElement('div');
      node.innerHTML = this.helpers.loadingHTML();

      this.quill.container.appendChild(node);
    }

    if (typeof this.options.upload !== 'function') {
      console.warn('[Missing config] upload function that returns a promise is required');
    }

    setTimeout(() => {
      if (!this.options.accepts) {
        if (this.handler === Constants.blots.image) {
          this.options.accepts = ['jpg', 'jpeg', 'png'];
        }
        if (this.handler === Constants.blots.video) {
          this.options.accepts = ['mp4', 'webm'];
        }
      }

      if (this.handler === Constants.blots.image) {
        this.possibleExtension = new Set(['apng', 'bmp', 'gif', 'ico', 'cur', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'tif', 'tiff', 'webp']);
      }
      if (this.handler === Constants.blots.video) {
        this.possibleExtension = new Set(['mp4', 'webm', '3gp', 'mp4', 'mpeg', 'quickTime', 'ogg']);
      }

      this.allowedFormatRegex = new RegExp('^(' + this.options.accepts.filter((el) => this.possibleExtension.has(el.toLowerCase()))
      .reduce((acc, el, i) => acc.concat(i !== 0 ? `|${el}` : `${el}`), '') + ')$', 'i');
    }, 1);
  }

  applyForToolbar() {
    const toolbar = this.quill.getModule('toolbar');
    toolbar.addHandler(this.handler, this.selectLocalFile.bind(this));
  }

  selectLocalFile() {
    this.range = this.quill.getSelection();
    this.fileHolder = document.createElement('input');
    this.fileHolder.setAttribute('type', 'file');
    this.fileHolder.setAttribute('accept', `${this.handler}/*`);
    this.fileHolder.onchange = this.fileChanged.bind(this);
    this.fileHolder.click();
  }

  loadFile(context) {
    this.loading.removeAttribute('class');
    this.loading.setAttribute('class', Constants.LOADING_CLASS_NAME);

    const file = context.fileHolder.files[0];
    if (!file) {
      console.warn('[File not found] Something was wrong, please try again!!');
      return null;
    }

    return file;
  }

  fileChanged() {
    const file = this.loadFile(this);

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop();

    if (!this.isValidExtension(extension)) {
      console.warn(
        '[Wrong Format] Format was wrong, please try with correct format!!'
      );
    }

    if (!this.hasValidMimeType(file.type)) {
      console.warn(
        `[Incorrect Mime Type] The MIME Type of uploaded file is not ${this.handler}!!`
      );
    }

    this.embedFile(file);
  }

  embedFile(file: File) {
    this.options.upload(file).then(
      (url) => {
        this.insertFileToEditor(url);
        this.loading.removeAttribute('class');
        this.loading.setAttribute('class', Constants.NONE_DISPLAY_CLASS_NAME);
      },
      (error) => {
        this.loading.removeAttribute('class');
        this.loading.setAttribute('class', Constants.NONE_DISPLAY_CLASS_NAME);
      }
    );
  }

  insertFileToEditor(url: string) {
    const range = this.range;
    this.quill.insertEmbed(
        range.index,
        this.handler,
        url
    );
  }

  isValidExtension(extension: string) {
    return extension && this.allowedFormatRegex.test(extension);
  }

  hasValidMimeType(type: string) {
    return type && type.startsWith(this.handler);
  }

}

export default BaseHandler;
