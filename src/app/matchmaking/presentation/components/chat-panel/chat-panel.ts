import {ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, signal, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatchmakingStore} from '../../../application/matchmaking.store';
import {Message} from '../../../domain/model/message.entity';
import {FeedbackService} from '../../../../shared/presentation/services/feedback.service';
import {LocaleService} from '../../../../shared/presentation/services/locale.service';
import {startPolling} from '../../../../shared/presentation/services/polling';
import {TrazzaDateTimePipe} from '../../../../shared/presentation/pipes/trazza-date-time.pipe';

/** Chat between carrier and merchant about one proposal. It polls for new messages every ten seconds. */
@Component({
  selector: 'app-chat-panel',
  imports: [FormsModule, MatFormFieldModule, MatInput, MatIconButton, MatIcon, TranslatePipe, TrazzaDateTimePipe],
  templateUrl: './chat-panel.html',
  styles: `
    .chat { display: flex; flex-direction: column; gap: 0.5rem; }
    .chat-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 26rem; min-height: 8rem; overflow-y: auto; padding: 0.25rem; }
    .chat-bubble { align-self: flex-start; max-width: 85%; padding: 0.5rem 0.75rem; border-radius: 12px; background: #f0f3ff; }
    .chat-bubble.mine { align-self: flex-end; background: var(--trazza-soft); }
    .chat-text { white-space: pre-wrap; word-break: break-word; }
    .chat-form { align-items: center; }
    .chat-input { flex: 1; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPanel implements OnInit {
  static readonly POLL_INTERVAL_MS = 10000;

  readonly proposalId = input.required<string>();
  readonly open = input<boolean>(true);

  protected readonly locale = inject(LocaleService);
  private readonly store = inject(MatchmakingStore);
  private readonly feedback = inject(FeedbackService);
  private readonly list = viewChild.required<ElementRef<HTMLDivElement>>('list');

  protected readonly messages = signal<Message[]>([]);
  protected draft = '';
  private failed = false;

  constructor() {
    startPolling(() => this.load(), ChatPanel.POLL_INTERVAL_MS);
  }

  ngOnInit(): void {
    this.load();
  }

  protected async send(): Promise<void> {
    const content = this.draft.trim();
    if (!content) return;
    try {
      const message = await this.store.sendMessage(this.proposalId(), content);
      this.messages.update(messages => [...messages, message]);
      this.draft = '';
      this.scrollDown();
    } catch (error) {
      this.feedback.showError(error);
    }
  }

  private async load(): Promise<void> {
    if (this.failed) return;
    try {
      const count = this.messages().length;
      this.messages.set(await this.store.listMessages(this.proposalId()));
      if (this.messages().length !== count) this.scrollDown();
    } catch (error) {
      this.failed = true;
      this.feedback.showError(error);
    }
  }

  private scrollDown(): void {
    setTimeout(() => {
      const element = this.list().nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }
}
