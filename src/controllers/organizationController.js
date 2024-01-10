const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const service = require('../services/organizationService');
const struct = require('../struct/organizationStruct');
const { ResponseError } = require('../helpers/response');

const getAllOrganization = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const { list: allOrgs, pagination } = await service.getAllOrganization({ limit, page });
    const dataList = allOrgs.map((org) => struct.OrganizationData(org));

    const data = {
      list: dataList,
      pagination: struct.OrganizationPagination(page, limit, pagination),
    };
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

const getOneOrganizationById = async (req, res, next) => {
  try {
    const { id } = req.params.id;
    await service.getOneOrganizationById(id);
    if (!id) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Please provide organizationId');
    }
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getAllOrganization,
  getOneOrganizationById,
};
