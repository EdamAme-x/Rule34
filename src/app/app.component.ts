import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { randomInt } from "./utils/randomInt";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "rule34";
  imageBaseUrl = "https://rule34.xxx/index.php?page=post&s=view&id=";
  imageUrl = "";
  trustUrl: SafeResourceUrl = "";

  ngOnInit() {
    this.imageUrl = this.imageBaseUrl + randomInt(1, 8000000);

    this.trustUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.imageUrl);
    console.log(this.trustUrl);
  }

  constructor(private sanitizer: DomSanitizer) {}
}
