import { toast } from 'react-toastify';

/**
 * @param props
 * props.state : 'info' | 'success' | 'warn' | 'error' | 'default';
 */

const toastNotify = (props) => {
  const { state, message } = props;

  if (state === 'default') {
    return toast(message, {
      position: 'bottom-left',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
  } else {
    return toast[state](message, {
      position: 'bottom-left',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
  }
};

export default toastNotify;
