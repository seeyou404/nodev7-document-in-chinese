### 内容
* [Assert](#)
  * [asset(value [,message])](#)
  * [asset.deepEqual(actural,expected, [,message])](#)
  * [asset.deepStrictEqual(actural,expected, [,message])](#)
  * [asset.doesNotThrow(block,[,error] [,message])](#)
  * [asset.equal(actural,expected, [,message])](#)
  * [asset.fail(actural,expected,message,operator)](#)
  * [asset.ifError(value)](#)
  * [asset.notDeepEqual(actural,expected, [,message])](#)
  * [asset.notDeepStrictEqual(actural,expected, [,message])](#)
  * [asset.notEqual(actural,expected, [,message])](#)
  * [asset.notStrictEqual(actural,expected, [,message])](#)
  * [asset.ok(value[,message])](#)
  * [asset.strictEqual(actural,expected, [,message])](#)
  * [asset.throws(block,[,error] [,message])](#)

# Assert
assert模块提供了一系列简单的断言测试, 可以用来测试常量。这个模块主要用于Node.js的内部使用。也可以通过require('assert')的方法,在自己的代码内部使用。然而,assert不是一个测试框架, 也并不打算用于一个测试仓库而使用。

## assert(value[, message])
别名：[assert.ok()]()

```javascript
  const assert = require('assert');
  assert(true);   // OK
  assert(1);     // OK
  assert(false); // 抛出:"AssertionError: false === true"
  assert(0); // 抛出："AssertionError:0===true"
  assert(false, "it is false"); //抛出："AssertionError: it is false"
```

## assert.deepEqual(actual, expected[, message])
对actural和expected参数进行严格比较。基本类型的数据采用的是===运算符。
进行对象比较的时候, 只有对象自身的可枚举的属性参与比较。对象的原型, symbols, 以及不可枚举的属性都不会进行比较。比如以下的例子不会抛出一个AssertionError的错误, 因为Error对象的属性都是不可枚举的。
```javascript
  // WARNING:这个不会抛出AssertionError的错误
  assert.deepEqual(Error('a'),Error('b'));
```
"Deep"相等意味着对于对象自身的可枚举的属性依然是可比较的
```javascript
  const assert = require('assert');

  const obj1 = {
    a: {
      b: 1
    }
  };

  const obj2 = {
    a: {
      b: 2
    }
  };

  const obj3 = {
    a: {
      b: 1
    }
  }

  const obj4 = Object.create(obj1);

  assert.deepEqual(obj1, obj1);
  // OK 对象和自身是相等的
  assert.deepEqual(obj1,obj2);
  // AssertionError:{ a: { b: 1 } } deepEqual { a: { b: 2 } }
  // 属性b的值是不一样的
  assert.deepEqual(obj1, obj3);
  // ok 对象是相等的
  assert.deepEqual(obj1, obj4);
  // AssertionError:{ a: { b: 1 } } deepEqual { a: { b: 2 } }
  // 原型会被忽略
```
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值

## assert.deepStrictEqual(actual, expected[, message])
这个方法和assert.deepEqual() 有两个不同的地方。首先, 基本属性类型的值使用===运算符进行比较。其次,也会对对象的原型进行严格的测试。

```javascript
const assert = require("assert");

assert.deepEqual({a:1},{a:'1'});
// OK 因为 1 == ‘1’

assert.deepStrictEqual({a:1},{a:'1'});
// AssertionError:{a:1} deepStrictEqual { a: '1' }
// 因为使用===进行比较 1！== ‘1’
```
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值

## assert.doesNotThrow(block[, error][, message])
断言函数块, 但不会抛出一个错误, 更多细节可参考[assert.throws()](#)

当assert.doesNotThrow被调用的时候,它会立即调用block函数。如果抛出了一个错误,并且和error参数指定的类型是一致的。接下来会抛出一个AssertionError错误,如果和error参数指定的类型是不一致的或者error参数是undefined,则error会被直接抛出。

如：将会抛出一个TypeError错误,因为在断言中无匹配的错误类型
```javascript
  assert.doesNotThrow(
    () => {
      throw new TypeError('Wrong Value');
    },
    SyntaxError
  )
```

然而,这个将会抛出一个带有'Got unwanted exception (TypeError)..'的AssertionError错误
```javascript
  assert.doesNotThrow(
    () => {
      throw new TypeError('Wrong Value');
    },
    TypeError
  )
```

如果抛出了一个AssertionError,同时,提供了一个值给message参数,则这个值会被添加到AssertionError的消息中
```javascript
assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong Value');
  },
  TypeError,
  'Whoops'
)
// Throws: AssertionError: Got unwanted exception (TypeError). Whoops
```


## assert.equal(actual, expected[, message])
使用==运算符测试actural和expected参数的相等性
```javascript
  const assert = require('assert');

  assert.equal(1, 1);
  // OK 1==1
  assert.equal(1, '1');
  // OK 1=='1'

  assert.equal(1, 2)
  // AssertionError: 1 == 2

  assert.equal({a: {b: 1}}, {a: {b: 1}})
  // AssertionError:{a: {b: 1}}, {a: {b: 1}}
```
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值

## assert.fail(actual, expected, message, operator)
抛出一个AssertionError错误。如果message参数为false(或者可以转化为false), 则AssertionError的message属性值将是actural和expected和operator的组合,否则就是message参数指定的值。
```javascript
const assert = require('assert');

assert.fail(1,2,undefined,'>');
// AssertionError:1>2

assert.fail(1,2,'whoops','>');
// AssertionError:'whoops'
```

## assert.ifError(value)
如果value的值是true或者可以被转化成true,则抛出value,它是非常实用的驱策是回调函数中的error参数
```javascript
const assert = require('assert');

assert.ifError(0);  // OK
assert.ifError(1);  // Throws 1
assert.ifError('error');  // Throws 'error'
assert.ifError(new Error());  // Throws Error
```

## assert.notDeepEqual(actual, expected[, message])
测试两个值的不相等. 和[assert.deepEqual()](#)的作用相反
```javascript
const assert = require('assert');

const obj1 = {
  a: {
    b: 1
  }
};

const obj2 = {
  a: {
    b: 2
  }
};

const obj3 = {
  a: {
    b: 1
  }
}

const obj4 = Object.create(obj1);

assert.notDeepEqual(obj1, obj1);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj2);
 // OK, obj1 and obj2 不严格相等

assert.notDeepEqual(obj1, obj3);
 // AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj4);
 // OK, obj1 and obj2 are not deeply equal
```
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值


## assert.notDeepStrictEqual(actual, expected[, message])
测试两个值的不严格相等,  和[assert.deepStrictEqual()](#)的作用相反
```javascript
const assert = require('assert');

assert.notDeepEqual({a:1}, {a:'1'});
// AssertionError:{ a: 1 } notDeepEqual { a: '1' }

assert.notDeepStrictEqual({a:1}, {a:'1'});
// OK

```
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值

## assert.notStrictEqual(actual, expected[, message])
使用!==运算符测试actural和expected之间的严格不相等性
```javascript
const assert = require('assert');

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError: 1 != 1

assert.notStrictEqual(1, '1');
// OK

```
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值

## assert.ok(value[, message])
测试value是否是truthy(为true或者能转换成true)。其和assert.equal(!!value, true, message)是相等的
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值

```javascript
const assert = require('assert');

assert.ok(true);  // OK
assert.ok(1);     // OK
assert.ok(false);
  // 抛出 "AssertionError: false == true"
assert.ok(0);
  // 抛出 "AssertionError: 0 == true"
assert.ok(false, 'it\'s false');
  // 抛出 "AssertionError: it's false"
```

## assert.strictEqual(actual, expected[, message])
使用===运算符测试actural和expected之间的相等性
```javascript
const assert = require('assert');

assert.strictEqual(1, 2);
  // AssertionError: 1 === 2

assert.strictEqual(1, 1);
  // OK

assert.strictEqual(1, '1');
  // AssertionError: 1 === '1'
```
如果两个值是不想等的, 一个AssertionError错误对象会被抛出, 其message属性的值就是参数中的message所指定的值, 如果message参数是undefined,则会赋予一个默认的属性值

## assert.throws(block[, error][, message])
希望block函数抛出一个错误

如果指定了error函数, 则error函数可以是一个构造函数, RegExp或者是一个验证函数

如果指定了message, 则block抛出错误的时候,其作为AssertionError对象的message属性

error为一个构造函数
```javascript
  assert.throws(
    () => {
      throw new Error('Wrong value');
    },
    Error
  )
```
error是一个RegExp

```javascript
assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  /value/
)
```

error是一个验证函数
```javascript
assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  function(err) {
    if ( (err instanceof Error) && /value/.test(err) ) {
      return true;
    }
  },
  'unexpected error'
);
```

注意：error不能是一个字符串, 如果error是一个字符串,则假定error是省略的,此时error将会作为message的信息,这很容易导致easy-to-miss错误

```javascript
// 这是一个错误  千万别这样做
assert.throws(myFunction, 'missing foo', 'did not throw with expected message');

// 用这种方式代替上
assert.throws(myFunction, /missing foo/, 'did not throw with expected message');
```
