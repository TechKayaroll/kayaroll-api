const UserRegistration = (companyId, payload) => ({
  fullname: payload.name,
  email: payload.email,
  companyId,
  roleId: '',
  password: payload.password || undefined,
});

const UserData = (user, organization) => ({
  fullname: user.fullname,
  email: user.email,
  role: user.roleId.name,
  companyId: organization.invitationCode,
  companyName: organization.name,
});

const Organization = (req) => ({
  organizationId: req._id,
  name: req.companyName || req.name,
  invitationCode: req.invitationCode || '',
});

const UserRegistrationResponse = (res, org, role) => ({
  userId: res._id.toString(),
  fullname: res.fullname,
  email: res.email,
  organization: org.name,
  role: role.roleId.name,
  profilePict: res.profilePict,
  invitationCode: org.invitationCode,
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
