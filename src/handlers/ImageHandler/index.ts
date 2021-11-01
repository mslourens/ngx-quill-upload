import BaseHandler, { Options } from '../BaseHandler';
import { Constants } from '../../utils';

class ImageHandler extends BaseHandler {
  constructor(quill, options: Options) {
    super(quill, options);

    this.handler = Constants.blots.image;
    this.applyForToolbar();
  }

}

export default ImageHandler;
