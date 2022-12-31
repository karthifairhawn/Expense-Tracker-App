package api.v1.entity.wallets;
import api.v1.entity.Tags;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CardAlerts {
	Long id;
	Long userId;
	Long creditCardId;
	String type;
	Long limitAlertOn;
	Long dueAlertBefore;
}
