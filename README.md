[![Stories in Ready](https://badge.waffle.io/Widdershin/rx-audible.png?label=ready&title=Ready)](https://waffle.io/Widdershin/rx-audible)
# rx-audible
Play music with Observables!

Here's what usage might look like (not yet implemented):

```js
import {Observable} from 'rx';
  
Observable.interval(1000).audible('C4', '8n');
  
Observable.scale('C4', '8n');
  
Observable.scaleRange('c2', 'e4', 'major')
```
