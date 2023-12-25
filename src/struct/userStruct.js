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

const MiddlewareUserResponse = (user, org) => ({
  userId: user._id.toString(),
  fullname: user.fullname,
  email: user.email,
  role_id: user.roleId._id.toString(),
  role: user.roleId.name,
  invitationCode: org.invitationCode,
  organizationId: org._id.toString(),
  organization: org.name,
});

module.exports = {
  UserRegistration,
  Organization,
  UserRegistrationResponse,
  MiddlewareUserResponse,
  UserData,
};
