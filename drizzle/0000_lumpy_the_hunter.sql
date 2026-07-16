CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tag` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`lessons_label` text NOT NULL,
	`level` text NOT NULL,
	`icon` text DEFAULT '</>' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_name` text NOT NULL,
	`student_level` text NOT NULL,
	`quote` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `courses` (`tag`,`title`,`description`,`lessons_label`,`level`,`icon`,`sort_order`,`published`) VALUES
('البداية الصح','أساسيات البرمجة','ابدأ من الصفر وابني طريقة تفكير المبرمج خطوة بخطوة.','24 درس','مبتدئ','</>',0,1),
('الذكاء الاصطناعي','AI للثانوية','افهم مفاهيم الذكاء الاصطناعي وطبّقها على مشروعات حقيقية.','18 درس','متوسط','AI',1,1),
('تطبيق عملي','حل المشكلات','تدريبات متدرجة وأسئلة تساعدك تتعامل مع أي مسألة بثقة.','30 تدريب','كل المستويات','{ }',2,1);
--> statement-breakpoint
INSERT INTO `faqs` (`question`,`answer`,`sort_order`,`published`) VALUES
('هل الكورس مناسب لو أنا لسه مبتدئ؟','أيوه، المنهج بيبدأ معاك من الصفر وبيشرح المفاهيم ببساطة قبل أي تطبيق عملي.',0,1),
('المحاضرات بتكون لايف ولا مسجلة؟','فيه محاضرات مباشرة للتفاعل وحل الأسئلة، وكل محاضرة بتكون متاحة مسجلة للمراجعة.',1,1),
('هل فيه متابعة للواجبات؟','كل وحدة فيها تدريبات وواجب عملي، مع متابعة دورية وتصحيح يوضحلك نقاط القوة والتحسين.',2,1);
--> statement-breakpoint
INSERT INTO `testimonials` (`student_name`,`student_level`,`quote`,`sort_order`,`published`) VALUES
('محمد أحمد','تانية ثانوي','كنت فاكر البرمجة صعبة جدًا، بس طريقة الشرح خلتني أفهم الفكرة وأحل بإيدي من أول أسبوع.',0,1),
('سارة خالد','أولى ثانوي','أكتر حاجة فرقت معايا المتابعة. كل سؤال كان بيترد عليه وبدأت أثق في حلي أكتر.',1,1),
('عمر مصطفى','ثالثة ثانوي','المحتوى منظم ومش بيجري. حسيت إني بتعلم بنفس نظام الجامعة بس بطريقة أبسط.',2,1);
