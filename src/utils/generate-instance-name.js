const PREFIX = 'order_book'

module.exports = (props) => {
  return `${PREFIX}_${props.id}${props.name ? `_${props.name}` : ''}`
}
