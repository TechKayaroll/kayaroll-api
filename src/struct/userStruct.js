const { default: mongoose } = require('mongoose');

const UserRegistration = (companyId, payload) => ({
  fullname: payload.name.trim(),
  email: payload.email,
  companyId,
  roleId: '',
  password: payload.password || undefined,
});

const UserData = (user, organization, uniqueUserId) => ({
  userId: uniqueUserId,
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

const UserRegistrationResponse = (userOrg) => ({
  userId: userOrg.userId._id.toString(),
  uniqueUserId: userOrg.uniqueUserId,
  fullname: userOrg.userId.fullname || 'unknown',
  email: userOrg.userId.email,
  role: userOrg.userId.roleId.name,
  organizationId: userOrg.organizationId._id,
  organization: userOrg.organizationId.name,
  invitationCode: userOrg.organizationId.invitationCode,
});

const UserOrgProfile = (userOrg) => ({
  userId: userOrg?._id,
  fullname: userOrg?.fullname,
  email: userOrg?.email,
  uniqueUserId: userOrg?.uniqueUserId,
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
  userOrganizationId: userOrg._id.toString(),
});

const UserOrganizationLocationPayload = (payload) => ({
  userId: payload.userId,
  organizationId: payload.organizationId,
  userOrganizationId: payload.userOrganizationId,
  locationId: payload.locationId,
});
const UserOrganizationLocation = (payload) => ({
  userOrganizationLocationId: payload._id,
  userId: payload.userId,
  organizationId: payload.organizationId,
  userOrganizationId: payload.userOrganizationId,
  locationId: payload.locationId,
});

const UserOrganizationLocationDetail = (userOrgLocation) => ({
  userId: userOrgLocation.userId._id,
  name: userOrgLocation.userId.fullname,
  email: userOrgLocation.userId.email,
  roleId: userOrgLocation.userId.roleId._id,
  role: userOrgLocation.userId.roleId.name,
  uniqueUserId: userOrgLocation.userOrganizationId.uniqueUserId,
  locationId: userOrgLocation.locationId,
  organizationId: userOrgLocation.organizationId._id,
  organizationName: userOrgLocation.organizationId.name,
  invitationCode: userOrgLocation.organizationId.invitationCode,
});

const UserByUserOrg = (userId, orgId) => ({
  userId: new mongoose.Types.ObjectId(userId),
  organizationId: new mongoose.Types.ObjectId(orgId),
});

module.exports = {
  UserRegistration,
  Organization,
  UserRegistrationResponse,
  MiddlewareUserResponse,
  UserData,
  UserReportProfile,
  UserOrganizationLocation,
  UserOrganizationLocationPayload,
  UserOrganizationLocationDetail,
  UserByUserOrg,
  UserOrgProfile,
};
