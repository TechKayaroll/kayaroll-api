const UserRegistration = (companyId, payload) => ({
  fullname: payload.name,
  email: payload.email,
  companyId,
  roleId: '',
  password: payload.password || undefined,
});

const UserData = (user, organization, uniqueUserId) => ({
  fullname: user.fullname,
  email: user.email,
  role: user.roleId.name,
  companyId: organization.invitationCode,
  companyName: organization.name,
  userId: uniqueUserId,
});

const Organization = (req) => ({
  organizationId: req._id,
  name: req.companyName || req.name,
  invitationCode: req.invitationCode || '',
});

const UserRegistrationResponse = (userOrg) => ({
  userId: userOrg.userId._id.toString(),
  uniqueUserId: userOrg.uniqueUserId,
  fullname: userOrg.userId.fullname || 'unknown',
  email: userOrg.userId.email,
  role: userOrg.userId.roleId.name,
  organization: userOrg.organizationId.name,
  invitationCode: userOrg.organizationId.invitationCode,
});

const UserReportProfile = (userOrg) => ({
  uniqueUserId: userOrg.uniqueUserId,
  fullname: userOrg.userId.fullname || 'unknown',
  email: userOrg.userId.email,
  role: userOrg?.userId?.roleId?.name,
  organization: userOrg.organizationId.name,
});

const MiddlewareUserResponse = (userOrg) => ({
  userId: userOrg.userId._id.toString(),
  fullname: userOrg.userId.fullname,
  email: userOrg.userId.email,
  role_id: userOrg.userId.roleId._id.toString(),
  role: userOrg.userId.roleId.name,
  invitationCode: userOrg.organizationId.invitationCode,
  organizationId: userOrg.organizationId._id.toString(),
  organization: userOrg.organizationId.name,
  uniqueUserId: userOrg.uniqueUserId,
  userOrganizationId: userOrg._id,
});

module.exports = {
  UserRegistration,
  Organization,
  UserRegistrationResponse,
  MiddlewareUserResponse,
  UserData,
  UserReportProfile,
};
