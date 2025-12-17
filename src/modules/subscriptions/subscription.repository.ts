import { prisma } from "../../config/prisma";

export async function getSubscriptionByID(id: bigint) {
    return prisma.subscription.findUnique({
        where: { subID: id },
    });
}
export async function createSubscription(data: {
    userID: bigint;
    channelID: bigint;
}) {
    return prisma.subscription.create({
        data: {
            userID: data.userID,
            channelID: data.channelID,
        },
    });
}
export async function deleteSubscription(id: bigint) {
    return prisma.subscription.delete({
        where: { subID: id },
    });
}
export async function getSubscriptionByUserAndChannel(userID: bigint, channelID: bigint) {
    return prisma.subscription.findFirst({
        where: { userID: userID, channelID: channelID },
    });
}
export async function listSubscriptionsByUser(userID: bigint, page: number, limit: number) {
    return prisma.subscription.findMany({
        where: { userID: userID },
        skip: (page - 1) * limit,
        take: limit,
    });
}
export async function UpdateSubscription(id: bigint, data: {
    channelID?: bigint;
}) {
    return prisma.subscription.update({
        where: { subID: id },
        data: data,
    });
}