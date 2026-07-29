package ec.uteq.sga.soporte.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Notifica por correo al usuario que reporto un ticket cuando este cambia de
 * estado. Se ejecuta en un hilo aparte (@Async, ver @EnableAsync en
 * SgaSoporteApplication) para que un problema de correo (SMTP caido, sin
 * credenciales, etc.) nunca haga fallar la actualizacion del ticket en si.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private static final Map<String, String> ESTADO_LEGIBLE = Map.of(
            "ABIERTO", "Abierto",
            "EN_PROCESO", "En proceso",
            "RESUELTO", "Resuelto",
            "CERRADO", "Cerrado"
    );

    private final JavaMailSender mailSender;
    private final String from;
    private final boolean credencialesConfiguradas;

    public EmailService(JavaMailSender mailSender,
                         @Value("${app.mail.from}") String from,
                         @Value("${spring.mail.username:}") String mailUsername) {
        this.mailSender = mailSender;
        this.from = from;
        this.credencialesConfiguradas = mailUsername != null && !mailUsername.isBlank();
    }

    @Async
    public void notificarCambioEstado(String correoDestino, String numeroTicket, String titulo,
                                       String estadoAnterior, String estadoNuevo) {
        if (correoDestino == null || correoDestino.isBlank()) {
            log.warn("No se pudo notificar el ticket {}: no se encontró correo del usuario que lo reportó", numeroTicket);
            return;
        }
        if (!credencialesConfiguradas) {
            log.info("MAIL_USERNAME no configurado: se omite el envío de correo para el ticket {} (destino: {})",
                    numeroTicket, correoDestino);
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(correoDestino);
            helper.setFrom(from);
            helper.setSubject("Ticket " + numeroTicket + " actualizado a " + legible(estadoNuevo));
            helper.setText(construirHtml(numeroTicket, titulo, estadoAnterior, estadoNuevo), true);

            mailSender.send(message);
            log.info("Correo de notificación enviado a {} (ticket {})", correoDestino, numeroTicket);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo de notificación del ticket {}: {}", numeroTicket, e.getMessage());
        }
    }

    private String legible(String estado) {
        return ESTADO_LEGIBLE.getOrDefault(estado, estado);
    }

    private String construirHtml(String numeroTicket, String titulo, String estadoAnterior, String estadoNuevo) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #243A76; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 20px;">Soporte Técnico — SGA</h1>
                        <p style="color: #a8bce8; margin: 4px 0 0 0; font-size: 14px;">Escuela Provincias Unidas</p>
                    </div>
                    <div style="padding: 32px; background: #f8fafc; border: 1px solid #e2e8f0;">
                        <p style="color: #334155; font-size: 15px;">Tu ticket ha sido actualizado:</p>
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <p style="color: #64748b; font-size: 13px; margin: 0 0 4px 0;">%s</p>
                            <p style="color: #243A76; font-weight: bold; font-size: 15px; margin: 0 0 16px 0;">%s</p>
                            <p style="color: #64748b; font-size: 13px; margin: 0;">
                                Estado: <span style="text-decoration: line-through;">%s</span>
                                &nbsp;→&nbsp;
                                <strong style="color: #243A76;">%s</strong>
                            </p>
                        </div>
                        <p style="color: #94a3b8; font-size: 12px;">
                            Ingresa al sistema para ver el detalle completo o agregar un comentario.
                        </p>
                    </div>
                </div>
                """.formatted(numeroTicket, titulo, legible(estadoAnterior), legible(estadoNuevo));
    }
}
