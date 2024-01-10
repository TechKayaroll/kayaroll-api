const OrganizationData = (org) => ({
  id: org._id,
  companyName: org.name,
  companyId: org.invitationCode,
});
const OrganizationPagination = (page, limit, totalData) => ({
  totalPage: Math.ceil(totalData / limit),
  currentPage: page,
});

module.exports = {
  OrganizationData,
  OrganizationPagination,
};
