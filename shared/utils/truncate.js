function truncate(str, max_length = 100) {
    if (str.length <= max_length) {
        return str;
    }

    const max_length_over_two = max_length / 2;
    const max_length_left = Math.floor(max_length_over_two);
    const max_length_right = Math.ceil(max_length_over_two);
    return str.substring(0, max_length_left) + '…' + str.substring(str.length - max_length_right);
}

module.exports = truncate;