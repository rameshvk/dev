'use strict';

import FormattedSegment from './FormattedSegment';

function shallowEqual(before, after) {
  for (const key in before) if (before.hasOwnProperty(key) && before[key] !== after[key]) {
    return false;
  }
  for (const key in after) if (after.hasOwnProperty(key) !== before.hasOwnProperty(key)) {
    return false;
  }
  return true;
}

/**
 * @namespace string
 * @class formatted
 */

/**
 * Build a FormattedString class based on the provided FormattedSegmentClass.
 * For the default FormattedString class, just use string.formatted.FormattedString
 * @method createFormattedStringClass
 * @param {FormattedSegment} FormattedSegmentClass - the class to use as the basis for FormattedString
 * @return {FormattedString} typed to provided FormattedSegment implementation
 * @static
 */
export function createFormattedStringClass(FormattedSegmentClass) {
  return class FormattedString {
    /**
     * Represents a formatted string.  It is implemented as a sequence of FormattedSegment objects.
     * This is a base class and contains no actual awareness of rendering beyond simple text rendering.
     * This class is immutable -- all mutation methods return a different object without modifying the current object.
     * @namespace string.formatted
     * @class FormattedString
     * @param {string|FormattedString|[string|FormattedSegment]} someType
     * @constructor
     */
    constructor(someType='') {
      if (typeof someType === 'string') this._segments = [createTextSegment(someType)];
      else if (someType instanceof FormattedString) this._segments = someType._segments;
      else if (Array.isArray(someType)) {
        this._segments = someType.map(unknownType => {
          if (typeof unknownType === 'string') return createTextSegment(unknownType);
          if (unknownType instanceof FormattedSegment) return unknownType;
          throw new Error(`Unexpected value: ${JSON.stringify(unknownType)}`);
        });
      } else throw new Error('Unknown constructor usage of FormattedString');
      this._count = this._segments.reduce((sum, seg) => sum + seg.count, 0);
    }

    /**
     * Append a bunch of other formatted strings together and return a new value.
     * @method append
     * @param {Any} others - any value that can be provided as a param to the constructor is acceptable here.
     * @return FormattedString
     */
    append(...others) {
      const segments = others.reduce(
        (all, other) => all.concat((new this.constructor(other))._segments),
        this._segments
      );
      return new this.constructor(segments);
    }

    /**
     * Slice a section of the formatted string.  Note that negative values are not allowed as parameters.
     * @method slice
     * @param {Number} start
     * @param {Number} end
     * @return FormattedString
     */
    slice(start=0, end=this._count) {
      const min = Math.max(0, Math.min(start, end, this._count));
      const max = Math.min(this._count, Math.max(start, end, 0));
      let count = 0, segments = [];

      this._segments.forEach(segment => {
        const ss = Math.max(count, min), ee = Math.min(count + segment.count, max);
        if (ss < ee) segments.push(segment.slice(ss - count, ee - count));
        count += segment.count;
      });
      return new this.constructor(segments);
    }

    /**
     * Works similar to Array:Splice except this does not mutate the FormattedString.
     * @method splice
     * @param {Number} start - cannot be negative
     * @param {Number} end - cannot be negative
     * @param {...Any} inserts - can be any type that is acceptable in the constructor
     * @return {Object} hash of {spliced, sliced} both of which are FormattedString
     */
    splice(start=0, deleteCount=this.count, ...inserts) {
      const insert = new FormattedString().append(...inserts);
      const slice = this.slice(start, start + deleteCount);
      const spliced = this._trySingleSegmentSplice(start, deleteCount, insert);
      if (spliced) return {spliced, slice};

      const left = this.slice(0, start);
      const right = this.slice(start + deleteCount);
      return {spliced: left.append(insert, right), slice};
    }

    /**
     * Update the styles for the whole formatted string based on the updator provided.  The updator is applied on all segments.
     * @method updateStyle
     * @param {Function|Object} updator - a function that maps the old renderInfo to the new or a hash that needs to be merged with the old renderInfo
     * @return FormattedString
     */
    updateStyle(updator) {
      return new this.constructor(this._segments.reduce(
        (segments, segment) => {
          const lastSegment = segments[segments.length - 1];
          const thisSegment = segment.updateStyles(updator);

          if (lastSegment && this.areSegmentsSameKind(lastSegment, thisSegment)) {
            segments[segments.length - 1] = lastSegment.splice(lastSegment.count, 0, thisSegment.text);
          } else {
            segments.push(thisSegment);
          }
          return segments;
        },
        []
      ));
    }

    /**
     * Similar to updateStyle but only applies to the specified range.
     * @method applyStyle
     * @param {Number} start
     * @param {Function|Object} updator - see updateStyle
     * @return FormattedString
     */
    applyStyle(start, end, updator) {
      const min = Math.max(0, Math.min(start, end, this._count));
      const max = Math.min(this._count, Math.max(start, end, 0));


      if (min === 0 && max === this._count) return this.updateStyle(updator);
      return this.slice(0, min).append(this.slice(min, max).updateStyle(updator), this.slice(max));
    }

    _trySingleSegmentSplice(start, deleteCount, insert) {
      if (insert._segments.length > 1) return;
      const insertSegment = insert && insert._segments[0];

      let count = 0, segment = null;

      for (let kk = 0, count = 0; kk < this._segments.length && start >= count; kk ++) {
        const segment = this._segments[kk];
        if (start < count + segment.count) {
          if (start + deleteCount > count + segment.count) return;
          if (insertSegment && !this.areSegmentsSameKind(segment, insertSegment)) return;
          const newSegment = segment.splice(start - count, deleteCount, insertSegment.text);
          return new this.constructor(this._segments.slice(0, kk))
            .append([newSegment], this._segments.slice(kk + 1));
        }
        count += segment.count;
      }
    }

    /**
     * Equality check to see if the two segments will get rendered with the same styles.
     * By default, this is implemented with a shallow comparison of the renderInfo values.
     * Derived classes may override this however.
     * @method areSegmentsSameKind
     * @param {FormattedSegment} seg1
     * @param {FormattedSegment} seg2
     * @return {Boolean}
     */
    areSegmentsSameKind(seg1, seg2) {
      if (seg1.isAtomic || seg2.isAtomic) return false;
      if (seg1.flowMode !== seg2.flowMode) return false;
      if (seg1.renderInfo === seg2.renderInfo) return true;
      return shallowEqual(seg1.renderInfo, seg2.renderInfo);
    }

    /**
     * Convert the whole formatted string to a simple string.
     * Uses FormattedSegment:toString.
     * @method toString
     */
    toString() {
      return this._segments.map(seg => seg.toString()).join('');
    }

    /**
     * Render the contents of this in the preferred mime type.
     * This is a generic function that can be used to render text, HTML or even React.
     * Note that for text/* types, it simply renders the individual segments and combines them.
     * For all other types, it returns the array of individually rendered segments.
     * @method render
     */
    render(context, mimeType='text/plain') {
      if (/^text\//i.test(mimeType)) {
        this._segments.map(seg => seg.render(context, mimeType)).join('');
      }
      return this._segments.map(seg => seg.render(context, mimeType));
    }
  }

  function createTextSegment(...args) {
    return FormattedSegmentClass.createTextSegment(...args);
  }
};

export const FormattedString = createFormattedStringClass(FormattedSegment);
