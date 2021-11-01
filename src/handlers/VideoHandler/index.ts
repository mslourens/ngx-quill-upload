import BaseHandler, { Options } from '../BaseHandler';
import { Constants } from '../../utils';

class VideoHandler extends BaseHandler {
  constructor(quill, options: Options) {
    super(quill, options);

    this.handler = Constants.blots.video;
    this.applyForToolbar();
  }
}

export default VideoHandler;
