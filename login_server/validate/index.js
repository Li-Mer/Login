class Validate {
  async undefinedCheck(val, par) {
    if (val === undefined) {
      throw { msg: `${par}字段必填`, code: 400, validate: null };
    }
  }

  async nullCheck(val, tips, par) {
    await this.undefinedCheck(val, par);

    if (typeof val !== "string") {
      throw { msg: `${par}字段必须是字符串类型`, code: 400, validate: null };
    }

    if (val.trim() === "") {
      throw { msg: tips, code: 422, validate: null };
    }
  }

  async isarrayCheck(val, tips, par) {
    await this.undefinedCheck(val, par);

    if (!Array.isArray(val)) {
      throw { msg: `${par}字段必须是数组类型`, code: 400, validate: null };
    }

    if (val.length <= 0) {
      throw { msg: tips, code: 422, validate: null };
    }
  }
}

module.exports = new Validate();
