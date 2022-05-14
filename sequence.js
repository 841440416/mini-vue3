/**
 * @desc 最长递增子序列算法
 * 贪心算法 + 二分查找
 */

// 3 2 8 9 5 6 7 11 15

// 找更有潜力的
// 3
// 2
// 2 8
// 2 8 9
// 2 5 9
// 2 5 6
// 2 5 6 7 11 15

// 1.当前项比最后一项大则放置末尾
// 2.如果当前项比最后一项小，通过二分查找找到比当前大的这一项，替换掉

function getSequence(arr) {
  const len = arr.length
  const resultIndex = [0]; // 以默认第0个为基准
  const p = arr.slice(0) // 标记索引

  let start;
  let end;
  let middle;
  let resultLastIndex; // 最后一个元素的索引
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI !== 0) {
      resultLastIndex = resultIndex[resultIndex.length - 1]
      if (arr[resultLastIndex] < arrI) { // 当前项比最后一项大
        p[i] = resultLastIndex; // 标记当前前一个对应的索引
        resultIndex.push(i)
        continue
      }
      // 二分查找寻找中间值
      start = 0;
      end = resultIndex.length - 1;
      while (start < end) {
        middle = (start + end) >> 1;
        // middle = (start + end)/2 | 0;
        if (arr[resultIndex[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      // 当前这个小就替换掉
      if (arrI < arr[resultIndex[start]]) {
        if (start > 0) { // 才需要替换
          p[i] = resultIndex[start - 1]; // 要将他替换的前一个记住
        }
        resultIndex[start] = i;
      }
    }
  }
  let i = resultIndex.length // 总长度
  let last = resultIndex[i - 1] // 找到了最后一项
  while (i-- > 0) { // 根据前驱节点一个个向前追溯查找
    resultIndex[i] = last // 最后一项肯定是正确的
    last = p[last]
  }
  return resultIndex
}
console.log(getSequence([3, 2, 8, 9, 5, 6, 7, 11, 15]));