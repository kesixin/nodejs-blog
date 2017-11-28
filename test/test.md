当我们在写支付账单的时候需要填写数字金额的大写，说真的平时没写还真写不出来，为了以后不出现尴尬的场面，还特意去练了那十个字。哈哈，当然，我们在php中也可以转换的，于是有了下面这个转换函数：

```
/**
 * 金额的小写转大写
 * @param $ns int 输入的数字
 */

function cny($ns) {
    static $cnums = array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"),
    $cnyunits = array("圆", "角", "分"),
    $grees = array("拾", "佰", "仟", "万", "拾", "佰", "仟", "亿");
    list($ns1, $ns2) = explode(".", $ns, 2);
    $ns2 = array_filter(array($ns2[1], $ns2[0]));
    $ret = array_merge($ns2, array(implode("", _cny_map_unit(str_split($ns1), $grees)), ""));
    $ret = implode("", array_reverse(_cny_map_unit($ret, $cnyunitss)));
    return str_replace(array_keys($cnums), $cnums, $ret);
}

function _cny_map_unit($list, $units) {
    $ul = count($units);
    $xs = array();
    foreach (array_reverse($list) as $x) {
        $l = count($xs);
        if ($x != "0" || !($l % 4))
            $n = ($x == '0' ? '' : $x) . ($units[($l - 1) % $ul]);
        else
            $n = is_numeric($xs[0][0]) ? $x : '';
        array_unshift($xs, $n);
    }
    return $xs;
}

```