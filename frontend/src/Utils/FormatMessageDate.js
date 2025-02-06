import moment from"moment";

const formatMessageDate = (date) => {
    const messageDate = moment(date);
    const now = moment();

    if (now.diff(messageDate, 'days') >= 1) {
      return `${messageDate.fromNow()} at ${messageDate.format('LT')}`; // e.g., 'a day ago at 2:30 PM'
    }
    return messageDate.format('LT'); // e.g., '2:30 PM'
  };

export default formatMessageDate