import util from "util";

export function nestedLog(data) {
  if (data instanceof Object) {
    console.log(util.inspect(data, false, null, true /* enable colors */));

    return;
  }

  console.log(data);
}
