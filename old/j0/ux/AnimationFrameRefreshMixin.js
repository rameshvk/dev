'use strict';

export default function AnimationFrameRefreshMixin(baseClass) {
  return class AnimatedFrameRefresh extends baseClass {
    constructor(props) {
      super(props);
      this._afFrequency = ('afFrequency' in props) ? props.afFrequency : 1;
      this._afCount = 0;
      this._afPending = null;
      this._afHandler = timestamp => {
        if (!this._afFrequency) return;
        this._afPending = window.requestAnimationFrame(this._afHandler);
        this._afCount ++;
        if (this._afCount >= this._afFrequency) {
          this._afCount = 0;
          this.onAnimationFrame(timestamp);
        }
      };
    }

    componentDidMount() {
      if (super.componentDidMount) super.componentDidMount();
      this._afHandler();
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) super.componentWillUnmount();
      window.cancelAnimationFrame(this._afPending);
      this._afPending = null;
    }
  };
}
