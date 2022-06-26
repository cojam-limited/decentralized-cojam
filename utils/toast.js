import { toast } from 'react-toastify';

/**
 * @param props
 * props.state : 'info' | 'success' | 'warn' | 'error' | 'default';
 */

const toastNotify = (props) => {
  const { state, message } = props;

  console.log('toasty', state, message);

  if (state === 'default') {
    return toast(message, {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
  } else {
    return toast[state](message, {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
  }
};

export default toastNotify;
