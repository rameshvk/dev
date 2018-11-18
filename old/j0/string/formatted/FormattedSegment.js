'use strict';

const AtomicText = '✲';
const Empty = {};

export default class FormattedSegment {
  /**
   * A formatted string consists of a sequence of formatted segments.
   * Each segment is expected to have an unique id (one is generated if not provided)
   * The flow mode is expected to capture the information on whether the segment is considered inline or block etc.
   * The isAtomic flag is used to determine if it is expected to be treated as one block of object for editing purposes.
   * The renderInfo is an opaque object that holds info on how to render this segment.
   *
   * This class is not sealed and it is acceptable for callers to override this and pass that to FormattedString.
   * @namespace string.formatted
   * @class FormattedSegment
   * @constructor
   */
  constructor({id=this.generateId(), text='', renderInfo=Empty, flowMode, isAtomic=false}) {
    this.id = id;
    this.text = text;
    this.flowMode = flowMode;
    this.isAtomic = isAtomic;
    this.renderInfo = renderInfo;
    if (isAtomic && !text) {
      this.text = AtomicText;
    }
    this.count = this.text.length;
  }

  /**
   * Returns a new segment which has the updated styles.
   * @method updateStyles
   * @param {Function|Object} styleUpdator - if this is an object, it is merged into the current renderInfo.
   * If a function is passed in as the styleUpdator param, it is called with the old renderInfo and is expected to return the new renderInfo.
   * @return FormattedSegment or this if there is no update
   */
  updateStyles(styleUpdator) {
    const updator = typeof styleUpdator == 'object' ? old => Object.assign({}, old, styleUpdator) : styleUpdator;
    const renderInfo = updator(this.renderInfo, this);
    if (renderInfo === this.renderInfo) return this;
    return new this.constructor({text: this.text, flowMode: this.flowMode, isAtomic: this.isAtomic, renderInfo});
  }

  /**
   * Returns a new segment that holds a slice of the contents of this with the same rendering
   * It is  an error to try to slice into an atomic segment.
   * @method slice
   * @param {Number} start
   * @param {Number} end
   */
  slice(start, end) {
    const min = Math.max(0, Math.min(start, end, this.count));
    const max = Math.min(this.count, Math.max(start, end, 0));
    if (min === 0 && max === this.count) return this;
    if (this.isAtomic) throw new Error('Cannot slice atomic entries');

    const text = this.text.slice(min, max);
    const flowMode = this.flowMode;
    const isAtomic = this.isAtomic;
    return new this.constructor({text, renderInfo: this.renderInfo, flowMode, isAtomic});
  }

  /**
   * Splices a piece of text into the current segment.  It is an error to splice into an atomic segment.
   * @method splice
   * @param {Number} start
   * @param {Number} deleteCount
   * @param {String} insertText - note that this is not a var-args and cannot be any type other than string.
   */
  splice(start, deleteCount, insertText='') {
    if (this.isAtomic) throw new Error('Cannot splice into atomic segments');
    const text = this.text.slice(0, start) + insertText + this.text.slice(start + deleteCount);
    const flowMode = this.flowMode;
    const isAtomic = this.isAtomic;
    return new this.constructor({text, renderInfo: this.renderInfo, flowMode, isAtomic});
  }

  /**
   * Converts this segment to the string.  Derived classes can override this safely.
   * Default implementation simply returns the text basis with a special character (✲) for atomic objects.
   * @method toString
   */
  toString() {
    return this.text;
  }

  /**
   * Render the contents of this in the preferred mime type.
   * This is a generic function that can be used to render text, HTML or even React.
   * @method render
   */
  render(context, mimeType='text/plain') {
    if (mimeType === 'text/plain') return this.toString();
  }

  /**
   * Generates a unique id for use with this segment.  Derived classes can overrid this safely.
   * @method generateId
   */
  generateId() {
    return'id' + Date.now().toString() + Math.floor(Math.random(1000)).toString();
  }

  /**
   * Creates text segments.
   * @method createTextSegment
   * @static
   */
  static createTextSegment(text, renderInfo) {
    return new this({text, renderInfo});
  }

  /**
   * Creates embedded (atomic) objects.
   * @method createEmbed
   * @static
   */
  static createEmbed(flowMode, renderInfo) {
    return new this({text: AtomicText, flowMode, renderInfo});
  }
};
