import { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js";
import { RequestTimeoutError, APIResponseError, APIErrorCode } from '@notionhq/client';

export function isRetryable(error: any) {
  return (error instanceof RequestTimeoutError) ||
    (error instanceof APIResponseError && error.code === APIErrorCode.RateLimited);
}

export function reply(interaction: ChatInputCommandInteraction, msg: string | MessagePayload | InteractionReplyOptions) {
  if (interaction.replied || interaction.deferred) {
    return interaction.editReply(msg);
  }
  else {
    return interaction.reply(msg);
  }
}

export async function catch_timeout(interaction: ChatInputCommandInteraction, callback: () => Promise<void>, try_count: number) {
  if (try_count > 5) {
    await reply(interaction, {
      content: '재시도 횟수가 5회를 초과했습니다. 요청을 취소합니다.',
      ephemeral: true,
    });
    return false;
  }

  try {
    try_count = (try_count ?? 0) + 1;
    await callback();
    return true;
  }
  catch (err) {
    if (!isRetryable(err)) throw err;

    await reply(interaction, {
      content: `요청에 실패했습니다. 재시도중... (${try_count} / 5)`,
      ephemeral: true,
    });

    await timer(100);
    return catch_timeout(interaction, callback, try_count);
  }
}

export function timer(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
