const isMobile = () => {
  let ua = navigator.userAgent.toLowerCase();
  let m = false;
  for (let mobileOS of ['android', 'iphone', 'ipad', 'ipod']) {
    if (ua.indexOf(mobileOS) > -1) {
      m = true;
      break;
    }
  }
  return m;
};

export default isMobile;
