const UserRegistration = (req, decode) => ({
  fullname: decode.name,
  profilePict: decode.picture,
  email: decode.email,
  companyId: req,
  roleId: '',
});

const Organization = (req) => ({
  organizationId: req._id,
  name: req.companyName || req.name,
  invitationCode: '',
});

const UserRegistrationResponse = (res, org, role) => ({
  userId: res._id.toString(),
  fullname: res.fullname,
  email: res.email,
  organization: org.name,
  role: role.roleId.name,
  profilePict: res.profilePict,
  invitationCode: org.invitationCode,
  token: '' || undefined,
});

const MiddlewareUserResponse = (res, org) => ({
  userId: res._id.toString(),
  fullname: res.fullname,
  email: res.email,
  organizationId: org._id,
  organization: org.name,
  role_id: res.roleId._id,
  role: res.roleId.name,
  profilePict: res.profilePict,
  invitationCode: org.invitationCode,
});

module.exports = {
  UserRegistration,
  Organization,
  UserRegistrationResponse,
  MiddlewareUserResponse,
};
