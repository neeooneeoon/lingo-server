export class IdentifyHelper {
  public static getId(_str: string) {
    let id = _str;
    id = id.toLowerCase();
    id = id.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    id = id.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    id = id.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    id = id.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    id = id.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    id = id.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    id = id.replace(/đ/g, 'd');
    id = id.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<| |\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      '',
    );
    id = id.replace(/ + /g, '');
    id = id.trim();
    return id;
  }
}
