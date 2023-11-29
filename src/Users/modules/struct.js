const UserRegistration = (companyId, payload) => ({
  fullname: payload.name,
  profilePict: payload.picture,
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

const MiddlewareUserResponse = (res, org) => ({
  userId: res._id.toString(),
  fullname: res.fullname,
  email: res.email,
  organizationId: org._id,
  organization: org.name,
  role_id: res.roleId._id,
  role: res.roleId.name,
  invitationCode: org.invitationCode,
});

module.exports = {
  UserRegistration,
  Organization,
  UserRegistrationResponse,
  MiddlewareUserResponse,
  UserData,
};
