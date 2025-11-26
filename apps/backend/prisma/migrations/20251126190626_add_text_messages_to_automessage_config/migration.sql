-- AlterTable
ALTER TABLE "AutoMessageConfig" ADD COLUMN     "errorText" TEXT NOT NULL DEFAULT '❌ Произошла ошибка. Попробуйте позже.',
ADD COLUMN     "notificationText" TEXT NOT NULL DEFAULT '✉️ Вы получаете автоматические сообщения. Если хотите отписаться, нажмите кнопку ниже.',
ADD COLUMN     "resubscribeButtonText" TEXT NOT NULL DEFAULT '🔔 Подписаться снова',
ADD COLUMN     "resubscribeSuccessText" TEXT NOT NULL DEFAULT '✅ Вы снова подписаны на автоматические сообщения.',
ADD COLUMN     "unsubscribeButtonText" TEXT NOT NULL DEFAULT '🔕 Отписаться от рассылки',
ADD COLUMN     "unsubscribeSuccessText" TEXT NOT NULL DEFAULT '👌 Вы отписались от автоматических сообщений.',
ADD COLUMN     "unsubscribeToggleText" TEXT NOT NULL DEFAULT '🔕 Отписаться';
