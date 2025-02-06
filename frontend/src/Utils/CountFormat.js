// format count of the notifications like instagram

const CountFormat = (count) => {
  if (count > 99) {
    return '99+';
  }
  return count;
}

export default CountFormat